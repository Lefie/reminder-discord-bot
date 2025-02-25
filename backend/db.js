import pg from 'pg'
const { Client } = pg

const client = new Client({
    user: "lemon",
    host: "localhost",
    database: "postgres",
    port:"5432"
})

try {   
    await client.connect()
    console.log("connected !")
} catch(error) {
    if(error){
        console.log("error connecting to db")
        console.log(error)
    }
}

export { client }

