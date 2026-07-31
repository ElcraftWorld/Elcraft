create extension if not exists pgcrypto;

create table if not exists public.inventory_items (
    id uuid primary key default gen_random_uuid(),
    child_id uuid not null,
    item_key text not null,
    item_name text not null,
    item_type text not null default 'general',
    item_icon text not null default '🎒',
    description text,
    quantity integer not null default 1 check (quantity >= 0),
    rarity text not null default 'common'
        check (rarity in ('common','uncommon','rare','epic','legendary')),
    is_equipped boolean not null default false,
    is_favorite boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (child_id, item_key)
);

create index if not exists inventory_items_child_id_idx
on public.inventory_items(child_id);

create index if not exists inventory_items_type_idx
on public.inventory_items(item_type);

create or replace function public.set_inventory_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists inventory_items_updated_at
on public.inventory_items;

create trigger inventory_items_updated_at
before update on public.inventory_items
for each row
execute function public.set_inventory_updated_at();

alter table public.inventory_items enable row level security;

drop policy if exists "Parents can view child inventory"
on public.inventory_items;

create policy "Parents can view child inventory"
on public.inventory_items
for select
to authenticated
using (
    exists (
        select 1
        from public.child_profiles cp
        where cp.id = inventory_items.child_id
        and cp.parent_id = auth.uid()
    )
);

drop policy if exists "Parents can add child inventory"
on public.inventory_items;

create policy "Parents can add child inventory"
on public.inventory_items
for insert
to authenticated
with check (
    exists (
        select 1
        from public.child_profiles cp
        where cp.id = inventory_items.child_id
        and cp.parent_id = auth.uid()
    )
);

drop policy if exists "Parents can update child inventory"
on public.inventory_items;

create policy "Parents can update child inventory"
on public.inventory_items
for update
to authenticated
using (
    exists (
        select 1
        from public.child_profiles cp
        where cp.id = inventory_items.child_id
        and cp.parent_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.child_profiles cp
        where cp.id = inventory_items.child_id
        and cp.parent_id = auth.uid()
    )
);

drop policy if exists "Parents can delete child inventory"
on public.inventory_items;

create policy "Parents can delete child inventory"
on public.inventory_items
for delete
to authenticated
using (
    exists (
        select 1
        from public.child_profiles cp
        where cp.id = inventory_items.child_id
        and cp.parent_id = auth.uid()
    )
);

create or replace function public.elcraft_add_inventory_item(
    p_child_id uuid,
    p_item_key text,
    p_item_name text,
    p_item_type text,
    p_item_icon text,
    p_description text default null,
    p_quantity integer default 1,
    p_rarity text default 'common',
    p_metadata jsonb default '{}'::jsonb
)
returns public.inventory_items
language plpgsql
security definer
set search_path = public
as $$
declare
    result public.inventory_items;
begin
    if not exists (
        select 1
        from public.child_profiles cp
        where cp.id = p_child_id
        and cp.parent_id = auth.uid()
    ) then
        raise exception 'You do not have permission to update this inventory.';
    end if;

    insert into public.inventory_items (
        child_id,
        item_key,
        item_name,
        item_type,
        item_icon,
        description,
        quantity,
        rarity,
        metadata
    )
    values (
        p_child_id,
        p_item_key,
        p_item_name,
        p_item_type,
        coalesce(nullif(p_item_icon, ''), '🎒'),
        p_description,
        greatest(p_quantity, 0),
        p_rarity,
        coalesce(p_metadata, '{}'::jsonb)
    )
    on conflict (child_id, item_key)
    do update set
        quantity = inventory_items.quantity + excluded.quantity,
        item_name = excluded.item_name,
        item_type = excluded.item_type,
        item_icon = excluded.item_icon,
        description = coalesce(excluded.description, inventory_items.description),
        rarity = excluded.rarity,
        metadata = inventory_items.metadata || excluded.metadata,
        updated_at = now()
    returning * into result;

    return result;
end;
$$;

grant execute on function public.elcraft_add_inventory_item(
    uuid,
    text,
    text,
    text,
    text,
    text,
    integer,
    text,
    jsonb
) to authenticated;

create or replace function public.elcraft_use_inventory_item(
    p_inventory_id uuid,
    p_quantity integer default 1
)
returns public.inventory_items
language plpgsql
security definer
set search_path = public
as $$
declare
    result public.inventory_items;
begin
    if p_quantity <= 0 then
        raise exception 'Quantity must be greater than zero.';
    end if;

    update public.inventory_items item
    set
        quantity = greatest(item.quantity - p_quantity, 0),
        is_equipped = case
            when greatest(item.quantity - p_quantity, 0) = 0 then false
            else item.is_equipped
        end,
        updated_at = now()
    where item.id = p_inventory_id
    and exists (
        select 1
        from public.child_profiles cp
        where cp.id = item.child_id
        and cp.parent_id = auth.uid()
    )
    returning * into result;

    if result.id is null then
        raise exception 'Inventory item was not found or access was denied.';
    end if;

    return result;
end;
$$;

grant execute on function public.elcraft_use_inventory_item(
    uuid,
    integer
) to authenticated;
