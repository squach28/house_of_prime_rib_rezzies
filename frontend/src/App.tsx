import { Box, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import Navbar from "./components/Navbar"
import { useEffect, useState } from "react"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"


const App = () => {
  const [authToken, setAuthToken] = useState<string>('')
  const [numOfPeople, setNumOfPeople] = useState<number>(2)
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs())
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

  console.log(numOfPeople)
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
            maxDate={dayjs().add(365, 'day')}
          />
        </LocalizationProvider>
      </Box>

    </div>
  )
}

export default App