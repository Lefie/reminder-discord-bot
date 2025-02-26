import {
    getRemindersArray, 
    addReminder, 
    getReminderItemById,
    updateReminderItemById,
    deleteReminderById
} from './utils.js'

const reminder_container = document.querySelector("#reminder-container")
const recurring_type = document.querySelector("#recurring_type")
const add_reminder_btn = document.querySelector("#add-reminder-btn")
const add_reminder_form = document.querySelector("#add-reminder-form")
const filter_btn = document.getElementsByClassName("filter-btn")
const reminders_container = document.querySelector("#reminders-container")
// search
const search_bar = document.querySelector("#search-bar")
const search_btn = document.querySelector("#smol-search-btn")

const edit_reminder_item_id = localStorage.getItem("reminder_item_id")
const isEditing = localStorage.getItem("isEditing")
console.log(edit_reminder_item_id, isEditing)

if(window.location.href.slice(31)!== "edit_reminder.html") {
    const item1 = localStorage.getItem("isEditing")
    const item2 = localStorage.getItem("reminder_item_id")
    if(item1){
        localStorage.removeItem("isEditing")
    }
    if(item2) {
        localStorage.removeItem("reminder_item_id")
    }
}

else if(edit_reminder_item_id && isEditing === "true") {
    // get item by id 
    const reminder_item = await getReminderItemById(edit_reminder_item_id)
    console.log(reminder_item)
    
    // fill out the form default value 
    document.querySelector("#event_name").setAttribute("value",reminder_item.event_name)
    document.querySelector("#event_from").setAttribute("value",reminder_item.event_from)
    document.querySelector("#event_to").setAttribute("value",reminder_item.event_to)
    document.querySelector("#reminder_date").setAttribute("value", reminder_item.reminder_date.slice(0,10))
    const recurring_types =  document.querySelector("#recurring_type")
    for(let i = 0; i < recurring_types.children.length; i++){
        const type_of_recurrence = reminder_item.recurringtype
        if(type_of_recurrence !== recurring_types.children[i].value) {
            recurring_types.children[i].selected = false
        }else {
            recurring_types.children[i].selected = true
            if( recurring_types.children[i].value === "weekly" ) {
                if(document.querySelector("#dow").classList.contains("hidden")){
                    document.querySelector("#dow").classList.remove("hidden")
                    document.querySelector("#day_of_week").setAttribute("value",reminder_item.day_of_week)
                }
            }else{
                if(!document.querySelector("#dow").classList.contains("hidden")){
                    document.querySelector("#dow").classList.add("hidden")
                }
            }

            if( recurring_types.children[i].value === "monthly" ) {
                if(document.querySelector("#dom").classList.contains("hidden")){
                    document.querySelector("#dom").classList.remove("hidden")
                    document.querySelector("#day_of_month").setAttribute("value", reminder_item.day_of_month)
                }
            }else{
                if(!document.querySelector("#dom").classList.contains("hidden")){
                    document.querySelector("#dom").classList.add("hidden")
                }
            }
           
        }
    }
    
    // update
    const update_btn = document.querySelector("#update-reminder-btn")
    update_btn.addEventListener("click", async(e)=> {
        e.preventDefault()
        let event_name = document.querySelector("#event_name").value
        let event_from = document.querySelector("#event_from").value
        let event_to = document.querySelector("#event_to").value
        let reminder_date = document.querySelector("#reminder_date").value
        let recurring_type_updated;
        let day_of_week;
        let day_of_month;
        
        for ( let i = 0; i < recurring_types.children.length; i++ ) {
            if(recurring_types.children[i].selected){
                recurring_type_updated = recurring_types.children[i].value
                if(recurring_types.children[i].value === "weekly") {
                    day_of_month = ""
                    day_of_week = document.querySelector("#day_of_week").value
                }else if(recurring_types.children[i].value === "monthly") {
                    day_of_week = ""
                    day_of_month = document.querySelector("#day_of_month").value
                }else {
                    day_of_month = ""
                    day_of_week =""
                }
            }
        }
        let isrecurring = recurring_type_updated === "none"?"f":"t"

        console.log(recurring_type_updated, day_of_week, day_of_month,isrecurring)
    
        let data_obj;
        if(event_from === "" && event_to === ""){
            data_obj = {
                "event_name":event_name, 
                "reminder_date":reminder_date,
                "recurringtype":recurring_type_updated,
                "day_of_week":day_of_week,
                "day_of_month":day_of_month,
                "isrecurring":isrecurring
            }
        }else if (event_from === "" && event_to) {
            data_obj = {
                "event_name":event_name, 
                "event_to":event_to,
                "reminder_date":reminder_date,
                "recurringtype":recurring_type_updated,
                "day_of_week":day_of_week,
                "day_of_month":day_of_month,
                "isrecurring":isrecurring
            }
        }else if(event_from && event_to === "") {
            data_obj = {
                "event_name":event_name, 
                "event_from":event_from,
                "reminder_date":reminder_date,
                "recurringtype":recurring_type_updated,
                "day_of_week":day_of_week,
                "day_of_month":day_of_month,
                "isrecurring":isrecurring
            }
        }else {
            data_obj = {
                "event_name":event_name, 
                "event_from":event_from,
                "event_to":event_to,
                "reminder_date":reminder_date,
                "recurringtype":recurring_type_updated,
                "day_of_week":day_of_week,
                "day_of_month":day_of_month,
                "isrecurring":isrecurring
            }
        }
        console.log(data_obj)
        const res = await updateReminderItemById(edit_reminder_item_id, data_obj)
        console.log(res)
        if(res === "values updated") {
            document.querySelector("#edit-reminder-form").reset()
            window.location.href="display_reminders.html"
            localStorage.removeItem("isEditing")
            localStorage.removeItem("reminder_item_id")
        }else{
            onFailure()
        }
    
    })
}


function createEle(ele, spec, name) {
    let element = document.createElement(ele)
    if(spec === "class"){
        element.classList.add(name)
    }
    if(spec === "id"){
        element.setAttribute("id",name)
    }
    return element
}

async function displayReminders() {
    try {
        let reminders = await getRemindersArray()
        console.log(reminders)

       if(reminders.length > 0 ){
            if(document.querySelector("#no_upcoming_reminders")) {
                document.querySelector("#no_upcoming_reminders").classList.add("hidden")
            }
            if(reminders.length >= 3){
                for (let i = 0; i < 3; i++){
                    let reminder_info = createEle("div", "class","reminder-info")
                    let evt_name = createEle("h3")
                    evt_name.textContent = reminders[i].event_name
                    reminder_info.appendChild(evt_name)
                    

                    let reminder_date = createEle("p")
                    reminder_date.textContent = reminders[i].reminder_date.slice(0,10)
                    reminder_info.appendChild(reminder_date)
                    console.log(reminder_info)

                    let time = createEle("p")
                    console.log(reminders[i].event_from, reminders[i].event_to)
                    if(reminders[i].event_from === null && reminders[i].event_to === null ){
                        time.textContent = `No Time Shown`
                    }else if(reminders[i].event_from && reminders[i].event_to === null) {
                        time.textContent = `${reminders[i].event_from} - ?`
                    }else if(reminders[i].event_from === null && reminders[i].event_to) {
                        time.textContent = `? - ${reminders[i].event_to}`
                    }else{
                        time.textContent = `${reminders[i].event_from} - ${reminders[i].event_to}`
                    }
                    reminder_info.appendChild(time)
                    if(reminder_container) {
                        reminder_container.appendChild(reminder_info)
                    } 
                }
                let etc = createEle("p","class","etc")
                etc.textContent = "More..."
                if(reminder_container) {
                    reminder_container.appendChild(etc)
                }
             }else {
                
                for (let i = 0; i < reminders.length; i++){
                    let reminder_info = createEle("div", "class","reminder-info")
                    let evt_name = createEle("h3")
                    evt_name.textContent = reminders[i].event_name
                    reminder_info.appendChild(evt_name)
                    

                    let reminder_date = createEle("p")
                    reminder_date.textContent = reminders[i].reminder_date.slice(0,10)
                    reminder_info.appendChild(reminder_date)
                    console.log(reminder_info)

                    let time = createEle("p")
                    console.log(reminders[i].event_from, reminders[i].event_to)
                    if(reminders[i].event_from === null && reminders[i].event_to === null ){
                        time.textContent = `No Time Shown`
                    }else if(reminders[i].event_from && reminders[i].event_to === null) {
                        time.textContent = `${reminders[i].event_from} - ?`
                    }else if(reminders[i].event_from === null && reminders[i].event_to) {
                        time.textContent = `? - ${reminders[i].event_to}`
                    }else{
                        time.textContent = `${reminders[i].event_from} - ${reminders[i].event_to}`
                    }
                    reminder_info.appendChild(time)
            
                    reminder_container.appendChild(reminder_info)
                }
                let etc = createEle("p","class","etc")
                etc.textContent = "That's all"
                reminder_container.appendChild(etc)

             }
        }else{
            if(document.querySelector("#no_upcoming_reminders")){
                document.querySelector("#no_upcoming_reminders").classList.remove("hidden")
            }
        }
    }catch(err){
        console.log("error: ", err)
    }
}

// display reminders 
async function viewReminders() {
    const all_reminders = await getRemindersArray()
    updateRemindersUI(all_reminders)
    const filter_tags = document.querySelector("#filter-tags")
    
    if(search_btn && search_bar ) {
        search_btn.addEventListener("click", (e)=> {
            e.preventDefault()
            const input_val = search_bar.value
            let reminders = []

            if(!isSelected(filter_tags)) {
                console.log("all",reminders)
                
                // reminders : populate data, filtered by name
                reminders = all_reminders.filter((reminder)=>{
                    console.log("in here",reminder.event_name.toLowerCase().includes(input_val))
                    return reminder.event_name.toLowerCase().includes(input_val)
                })

                console.log("after filter",reminders)
                
            }else if(whichSelected(filter_tags) === "reminder-date-tag"){
                console.log("reminder date tag")
                console.log("input reminder date", input_val)
                // TO DO : input check
                reminders = all_reminders.filter((reminder) => {
                    return reminder.reminder_date.slice(0,10) === input_val
                } )
                console.log(reminders)
                
            }else if(whichSelected(filter_tags) === "top-tag") {
                // TODO: input check 
                const num = parseInt(input_val)
                console.log("top tag",num)
                for(let i = 0; i < num; i++){
                    console.log(all_reminders[i])
                    reminders.push(all_reminders[i])
                }
                console.log(reminders,"top tag")
                
            }else if(whichSelected(filter_tags) === "month-tag") {
                console.log("month tag")
                // TODO: Input check 
                const input_month = parseInt(input_val)
                reminders = all_reminders.filter((reminder)=> {
                    return input_month === new Date(reminder.reminder_date).getMonth() + 1
                })
                
            }
            updateRemindersUI(reminders)
            search_bar.value = ""
        })
    }
}

function updateRemindersUI(reminders) {
    // console.log("all",reminders)
    //wipe out all the current reminders first 
    if(reminders_container) {
        while(reminders_container.hasChildNodes()) {
            reminders_container.removeChild(reminders_container.firstChild)
        }
    }

    // display the input reminders 
    for ( let i = 0; i < reminders.length; i ++){
        let reminder_item = createEle("div","class","reminder-item")
        reminder_item.setAttribute("id", reminders[i].reminder_id)
        

        let reminder_name = createEle("p")
        reminder_name.textContent = reminders[i].event_name
        reminder_item.appendChild(reminder_name)

        let event_from = createEle("p")
        event_from.textContent = reminders[i].event_from
        reminder_item.appendChild(event_from)

        let event_to = createEle("p")
        event_to.textContent = reminders[i].event_to
        reminder_item.appendChild(event_to)

        let recurring_type  = createEle("p")
        recurring_type.textContent = reminders[i].recurringtype
        reminder_item.appendChild(recurring_type)

        let reminder_date = createEle("p")
        reminder_date.textContent = reminders[i].reminder_date.slice(0,10)
        reminder_item.appendChild(reminder_date)

        let editing = createEle("div","id","editing-tools")
        let span_edit = createEle("span")
        span_edit.textContent = "E"
        span_edit.setAttribute("id","edit_reminder")
        span_edit.addEventListener("click", (e) => {
            const reminder_item_id = span_edit.parentElement.parentElement.id
            //console.log(typeof reminder_item_id)
            localStorage.setItem("reminder_item_id",reminder_item_id)
            localStorage.setItem("isEditing","true")
            window.location.href="edit_reminder.html"
        })
        let span_delete = createEle("span")
        span_delete.textContent = "X"
        span_delete.setAttribute("id","delete reminder")
        span_delete.addEventListener("click", (e) => {
            console.log("delete btn clicked ")
            deleteConfirmationPop(span_delete.parentElement.parentElement.id)
        })
        editing.appendChild(span_edit)
        editing.appendChild(span_delete)
        reminder_item.appendChild(editing)

        if(reminders_container) {
            console.log("here")
            reminders_container.appendChild(reminder_item)
        }
    }
}

function isSelected(parent_ele) {
    const len = parent_ele.children.length
    for( let i = 0; i < len; i++){
        if(parent_ele.children[i].classList.contains("selected")){
            return true
        }
    }
    return false
}

function whichSelected(parent_ele) {
    const len = parent_ele.children.length
    console.log(len,"which selected")
    for( let i = 0; i < len; i++){
        if(parent_ele.children[i].classList.contains("selected")){
            console.log(parent_ele.children[i].id)
            return parent_ele.children[i].id
        }
    }

}

function deleteConfirmationPop(reminder_item_id) {
    const notification_ele = document.querySelector("#delete-pop-up")
    if(notification_ele.classList.contains("hidden")) {
        notification_ele.classList.remove("hidden")
        const cancel_btn = document.querySelector("#cancel-delete")
        const delete_btn = document.querySelector("#delete-reminder")
        console.log(cancel_btn, delete_btn)
        cancel_btn.addEventListener("click", (e) => {
            if(!notification_ele.classList.contains("hidden")){
                notification_ele.classList.add("hidden")
            }
        })

        delete_btn.addEventListener("click", async (e)=> {
            const resp = await deleteReminderById(reminder_item_id)
            console.log("delete delete",resp)
            if(resp === "deleted") {
                if(!notification_ele.classList.contains("hidden")){
                    notification_ele.classList.add("hidden")
                    window.location.href="display_reminders.html"
                }
            }
        })
    }
}

if(recurring_type) {
    recurring_type.addEventListener("change", (e) => {
        console.log(e.target.value)
        if(e.target.value === "weekly") {
            document.querySelector("#dow").classList.remove("hidden")
        }else{
            if (!document.querySelector("#dow").classList.contains("hidden")) {
                document.querySelector("#dow").classList.add("hidden")
            }
        }
    
        if(e.target.value === "monthly") {
            document.querySelector("#dom").classList.remove("hidden")
        }else{
            if (!document.querySelector("#dom").classList.contains("hidden")) {
                document.querySelector("#dom").classList.add("hidden")
            }
        }
    })
}

if(add_reminder_btn) {
    add_reminder_btn.addEventListener("click", async(e) => {
        e.preventDefault()
        /* input check 
        - event_name not empty        
         */
        console.log("e",e)
        let form_data = new FormData(add_reminder_form,add_reminder_btn)

        let event_name = form_data.get("event_name")
        let event_from = form_data.get("event_from")
        let event_to = form_data.get("event_to")
        let reminder_date = form_data.get("reminder_date")
        let recurring_type = form_data.get("recurring_type")
        let day_of_week = form_data.get("day_of_week")
        let day_of_month = form_data.get("day_of_month")
        
        console.log(event_name, event_from, event_to, reminder_date, recurring_type, day_of_week, day_of_month )
        let data_obj = {}
        if(event_from === "" && event_to === ""){
            data_obj = {
                "event_name":event_name, 
                "reminder_date":reminder_date,
                "recurring_type":recurring_type,
                "day_of_week":day_of_week,
                "day_of_month":day_of_month
            }
        }else if (event_from === "" && event_to) {
            data_obj = {
                "event_name":event_name, 
                "event_to":event_to,
                "reminder_date":reminder_date,
                "recurring_type":recurring_type,
                "day_of_week":day_of_week,
                "day_of_month":day_of_month
            }
        }else if(event_from && event_to === "") {
            data_obj = {
                "event_name":event_name, 
                "event_from":event_from,
                "reminder_date":reminder_date,
                "recurring_type":recurring_type,
                "day_of_week":day_of_week,
                "day_of_month":day_of_month
            }
        }else {
            data_obj = {
                "event_name":event_name, 
                "event_from":event_from,
                "event_to":event_to,
                "reminder_date":reminder_date,
                "recurring_type":recurring_type,
                "day_of_week":day_of_week,
                "day_of_month":day_of_month
            }
        }
        
        // console.log("right before", data_obj)
        try {
            const res = await addReminder(data_obj)

            console.log(res.msg,"utils")
            if(res.msg === "insertion success"){
                onSuccess()
            }else{
                onFailure()
            }
        }catch(e){
            console.log(e)
        }
        

        add_reminder_form.reset()
        
    })
}

if(filter_btn) {
    for (let btn of filter_btn) {
        btn.addEventListener("click",(e) => {
            const ele = document.querySelector(`#${e.target.id}`)
            // if this element already has 'selected', then remove it
            if ( ele.classList.contains('selected')){
                ele.classList.remove('selected')
            } else{
                if( !checkSelected(e.target.id)) {
                     // check if other btns are not selected 
                    ele.classList.add('selected')
                }
            }
        })
    }
}


function onSuccess(){
    const msg = document.querySelector("#success-msg")
    msg.classList.remove("hidden")
    setTimeout(()=>{
        if(!msg.classList.contains("hidden")){
            msg.classList.add("hidden")
        }
    },3000) 
    
}

function onFailure() {
    const msg = document.querySelector("#failure-msg")
    msg.classList.remove("hidden")
    setTimeout(()=>{
        if(!msg.classList.contains("hidden")){
            msg.classList.add("hidden")
        }
    },3000) 
}

function checkSelected(btn_id) {
    // take in an btn that user clicks on
    // check if other btns are also selected 
    // if so, return true
    // else return false 
    for (let btn of filter_btn) {
       if (btn.id !== btn_id){
        const res = document.querySelector(`#${btn.id}`).classList.contains("selected")
        if ( res === true ){
            return true
        }
       }
    }
    return false
}


displayReminders()
viewReminders()

