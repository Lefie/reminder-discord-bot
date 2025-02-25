// this file contains functions which retreive data from the database 


// through API 

const domain = `http://localhost:3000`

export async function getRemindersArray() {
    const url = `${domain}/get_all_reminders`
    try {
        const res = await fetch(url)
        const data = await res.json()
        console.log(data)
        return data

    }catch(error) {
        console.log("an error occurred", error)
        return []
    }
}

export async function addReminder(new_reminder_obj) {
    const url = `${domain}/create_reminder`

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(new_reminder_obj),
        })

        const response = await res.json()
        console.log(response.msg)
        return response


    }catch(error){
        console.log("an error occured", error)
    }
}

export async function getReminderItemById(reminder_item_id) {
    const url = `${domain}/get_reminder/${reminder_item_id}`
    try {
        const res = await fetch(url)
        const reminder = await res.json()
        console.log(reminder)
        return reminder[0]

    }catch(error) {
        console.log("an error occured when getting a reminder by id")
    }
}

export async function updateReminderItemById(reminder_item_id, data_obj) {
    const url = `${domain}/update_reminder/${reminder_item_id}`
    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(data_obj),
        })

        const response = await res.json()
        console.log(response)
        return response.msg
        
    }catch(error) {
        console.log("an error occured when getting a reminder by id")
    }
}

export async function deleteReminderById(reminder_item_id) {
    const url = `${domain}/delete/${reminder_item_id}`
    try {
        const response = await fetch(url, {
            method: 'DELETE'
        })
        const data = await response.json()
        console.log(data.msg)
        return data.msg
        
    }catch(error) {
        console.log("an error occured when deleting the reminder")
        console.log(error)
    }
}