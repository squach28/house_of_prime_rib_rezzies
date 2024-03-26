import { Request, Response } from "express"
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())

const getAuthToken = async () => {
    const URL = 'https://www.opentable.com/restref/client/?restref=1779'
    const html = await fetch(URL)
        .then(res => res.text())
    const re = /"(.*?)"/g
    const matches = [...html.matchAll(re)]
    for(let i = 0; i < matches.length; i++) {
        if(matches[i][0] === '"authToken"') {
            let token = matches[i+1][0]
            token = token.split('"')[1]
            return token
        }
    }
    return ''
}

const fetchTimeSlots = async (authToken: string, date: string, partySize: number) => {
    const TIME_SLOT_URL = 'https://www.opentable.com/restref/api/availability?lang=en-US'
    const HOURS_IN_DAY = 24
    const timeSlotRequests = []
    for(let i = 0; i < HOURS_IN_DAY; i++) {
        const hour = i.toString().padStart(2, '0')
        const dateTime = `${date}T${hour}:00`
        const body = JSON.stringify({
            rid: 1779,
            dateTime,
            partySize
        })

        const promise = fetch(TIME_SLOT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body
        })
            .then(res => res.json())
        timeSlotRequests.push(promise)
    }
    try {
        const timeSlots = await Promise.all(timeSlotRequests)
        const availableTimeSlots: Set<string> = new Set()
        timeSlots.forEach(timeSlot => {
            if(timeSlot.availability[date] === undefined) {
                return
            } else {
                if(timeSlot.availability[date].timeSlots.length === 0) {
                    return
                } else {
                    timeSlot.availability[date].timeSlots.forEach((slot: { dateTime: string, time: string }) => {
                        if(slot.dateTime.startsWith(date)) {
                            availableTimeSlots.add(slot.dateTime)
                        }
                    })
                }
            }
        })
        const result: string[] = Array.from(availableTimeSlots)
        result.sort((a: string, b: string) => {
            return Date.parse(a) - Date.parse(b)
        })
        return result
    } catch(e) {
        console.log(e)
        return []
    }

}


app.get('/', async (req: Request, res: Response) => {
    const authToken = await getAuthToken()
    const partySize = req.query.partySize
    const date = req.query.date
    if(date === undefined || partySize === undefined) {
        res.status(400).json({ message: 'URL is missing date query'})
    } else {
        try {
            const timeSlots = await fetchTimeSlots(authToken, date as string, parseInt(partySize as string))
            res.status(200).json(timeSlots)
        } catch(e) {
            console.log(e)
            res.status(500).json({ message: 'Something went wrong, please try again later.'})
        }

    }    
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})