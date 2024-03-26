import { Box, Button, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import Navbar from "./components/Navbar"
import { useEffect, useState } from "react"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"


const App = () => {
  const [authToken, setAuthToken] = useState<string>('')
  const [numOfPeople, setNumOfPeople] = useState<number>(2)
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs())
  const [result, setResult] = useState()
  const numOfPeopleRange = [2, 3, 4, 5, 6, 7, 8] // reservations are only allowed for parties of 2 up to 8
  const MAX_ADVANCE_RESERVATION_TIME = 365 // reservations are only allowed one year in advance

  useEffect(() => {
    const getAuthToken = (html: string) => {
      const re = /"(.*?)"/g
      const matches = [...html.matchAll(re)]
      for(let i = 0; i < matches.length; i++) {
        if(matches[i][0] === '"authToken"') {
          return matches[i+1][0].split('"')[1]
        }
      }
      return ''
    }

    const fetchAuthToken = () => {
      fetch('https://www.opentable.com/restref/client/?restref=1779')
        .then(res => res.text())
        .then(html => {
          const authToken = getAuthToken(html)
          localStorage.setItem('authToken', authToken)
          return authToken
        })
    }

    if(localStorage.getItem('authToken')) {
      const authToken = localStorage.getItem('authToken') as string
      setAuthToken(authToken)
    } else {
      fetchAuthToken()
    }
  }, [])

  const onSelectChange = (e: SelectChangeEvent) => {
    setNumOfPeople(parseInt(e.target.value))
  }

  const onDateChange = (value: dayjs.Dayjs | null,) => {
    if(value) {
      setDate(value)
    }
  }
  
  const fetchTimeSlots = async () => {
    const timeSlotUrl = 'https://www.opentable.com/restref/api/availability?lang=en-US'
    const timeSlotRequests = []
    const HOURS_IN_DAY = 24
    for(let i = 0; i < HOURS_IN_DAY; i++) {
      const hour = i.toString().padStart(2, '0')

      const body = JSON.stringify({
        rid: 1779,
        dateTime: `${date.format('YYYY-MM-DD')}T${hour}:00`,
        partySize: numOfPeople
      })
      const promise = fetch(timeSlotUrl, {
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
    const promises = await Promise.all(timeSlotRequests)
    console.log(promises)
  }

  fetchTimeSlots()


  return(
    <div className="min-h-screen p-4">
      <Navbar />
      <Box 
        sx={{
          display: 'flex'
        }}
      >
        <Select
          defaultValue={numOfPeople.toString()}
          value={numOfPeople.toString()}
          onChange={onSelectChange}
        >
          {numOfPeopleRange.map(num => (
            <MenuItem key={num} value={num}>{`${num} people`}</MenuItem>
          ))}
        </Select>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            defaultValue={date}
            disablePast={true}
            maxDate={dayjs().add(MAX_ADVANCE_RESERVATION_TIME, 'day')}
            onAccept={onDateChange}
            
          />
        </LocalizationProvider>
        <Button
          variant="outlined"
        >
          Search
        </Button>
      </Box>
      {result 
          ?
            <div>result</div>
          :
            <div>no result</div>
        }

    </div>
  )
}

export default App