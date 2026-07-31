ELCraft Parent Gate System
==========================

FILES TO CREATE
---------------

1) parent-gate.js
-----------------

```javascript
import { supabase } from "./supabase-client.js";

const SESSION_KEY = "elcraft_parent_mode_until";
const DURATION_MINUTES = 10;

(function initParentGate() {
    createButton();
})();

function createButton() {

    const btn = document.createElement("button");

    btn.id = "parentGateButton";
    btn.innerHTML = "🗝️";

    Object.assign(btn.style,{
        position:"fixed",
        top:"12px",
        right:"12px",
        width:"52px",
        height:"52px",
        borderRadius:"50%",
        border:"3px solid white",
        background:"#6b5cff",
        color:"white",
        fontSize:"26px",
        cursor:"pointer",
        zIndex:"99999",
        boxShadow:"0 5px 15px rgba(0,0,0,.25)"
    });

    btn.onclick = showPinDialog;

    document.body.appendChild(btn);

    if(parentModeActive()){
        showBanner();
    }
}

function parentModeActive(){

    const until = Number(localStorage.getItem(SESSION_KEY)||0);

    return Date.now()<until;

}

function enableParentMode(){

    const expires =
        Date.now() +
        DURATION_MINUTES*60*1000;

    localStorage.setItem(
        SESSION_KEY,
        expires
    );

}

async function showPinDialog(){

    if(parentModeActive()){
        location.href="parent-dashboard.html";
        return;
    }

    const pin =
        prompt("Enter Parent PIN");

    if(pin===null)return;

    const {data,error} =
        await supabase
            .rpc(
                "verify_parent_pin",
                {entered_pin:pin}
            );

    if(error){
        alert(error.message);
        return;
    }

    if(data===true){

        enableParentMode();

        location.href =
            "parent-dashboard.html";

    }else{

        alert("Incorrect Parent PIN");

    }

}

function showBanner(){

    const banner =
        document.createElement("div");

    banner.innerHTML =
        "👑 Parent Mode";

    Object.assign(
        banner.style,{
            position:"fixed",
            top:"75px",
            right:"12px",
            padding:"10px 16px",
            background:"#ffd84f",
            borderRadius:"12px",
            fontWeight:"bold",
            zIndex:"99998"
        });

    document.body.appendChild(banner);

}
```

Every game page only needs:

<script type="module" src="parent-gate.js"></script>


------------------------------------------------------------

2) SQL
-------

create table parent_settings (

    user_id uuid primary key references auth.users(id),

    pin_hash text not null,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

------------------------------------------------------------

Example RPC

verify_parent_pin

Input:
entered_pin text

Logic:

1. Read current user's pin_hash

2. Compare entered pin against hash

3. Return true / false

(Recommended to hash with pgcrypto's crypt()/gen_salt('bf') rather than storing the PIN.)

------------------------------------------------------------

3) First-time PIN setup page

parent-settings.html

Contains:

• Create PIN
• Change PIN
• Confirm PIN
• Save

After save:

update parent_settings

------------------------------------------------------------

Future enhancements

✓ Fingerprint login
✓ Face ID
✓ Parent profile
✓ Auto-lock after 10 minutes
✓ "Exit Parent Mode" button
