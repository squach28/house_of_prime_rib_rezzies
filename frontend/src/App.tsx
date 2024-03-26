import { Box, Button, CircularProgress, List, ListItem, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import { useEffect, useState } from "react"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"
import Sad from './assets/images/sad.png'
import Happy from './assets/images/happy.webp'


const App = () => {
  const [numOfPeople, setNumOfPeople] = useState<number>(2)
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs())
  const [loading ,setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<string[]>([])
  const numOfPeopleRange = [2, 3, 4, 5, 6, 7, 8] // reservations are only allowed for parties of 2 up to 8
  const MAX_ADVANCE_RESERVATION_TIME = 365 // reservations are only allowed one year in advance

  useEffect(() => {
    const today = dayjs()
    const initialPartySize = 2
    setLoading(true)
    fetch(`${import.meta.env.VITE_API_URL}?date=${formatDate(today)}&partySize=${initialPartySize}`)
      .then(res => res.json())
      .then(data => { 
        setResult(data)
        setLoading(false)
      })
  }, [])

  const fetchTimeSlots = async () => {
    const timeSlotUrl = `${import.meta.env.VITE_API_URL}?date=${formatDate(date)}&partySize=${numOfPeople}`
    const res = await fetch(timeSlotUrl)
    const timeSlots = await res.json()
    return timeSlots
  }

  const onSelectChange = (e: SelectChangeEvent) => {
    setNumOfPeople(parseInt(e.target.value))
  }

  const onDateChange = (value: dayjs.Dayjs | null,) => {
    if(value) {
      setDate(value)
    }
  }

  const formatDate = (date: dayjs.Dayjs) => {
    const formatted = date.toDate().toISOString().split('T')[0]
    return formatted
  }

  const onSearchClick = async () => {
    try {
      setLoading(true)
      const res = await fetchTimeSlots()
      setResult(res)
    } catch(e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  

  return(
    <div className="w-full flex flex-col min-h-screen p-4 bg-[#FAF9F6]">
      <h1 className="text-3xl text-center my-8 font-bold">
        House of Prime Rib Rezzies
      </h1>
      <Box 
        sx={{
          display: 'flex',
          marginX: 'auto'
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
          onClick={onSearchClick}
        >
          Search
        </Button>
      </Box>
      {loading ? 
        <Box 
          sx={{
            marginTop: 2,
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
        :
            <Box 
            sx={{
              marginTop: 2,
              width: '100%',
              display: 'flex',
              justifyItems: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {
              result.length > 0 
              ?
                <>
                  <h2 className="text-xl font-bold my-5"
                  >
                    Yippee! There's time slots available :3
                  </h2>
                  <img className="max-w-[50%] my-4" src={Happy} alt="smiling man with ok hand" />
                  <List sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    flex: 1
                  }}>
                    {result.map(time => (
                      <ListItem key={time} sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        flex: 1
                        
                      }}>
                        <p className="p-4 text-md bg-[#ABF0D1] rounded-md text-center font-bold min-w-[30%]">
                          {new Date(time).toLocaleDateString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric'
                          })}
                        </p>
                      </ListItem>
                    ))}
                  </List>
                </>
              :
                <>
                  <h2 className="text-2xl font-bold my-5">
                    No available time slots for this date 
                  </h2>
                  <img src={Sad} alt="crying emoji" />
                </>
            }
          </Box>
        }

    </div>
  )
}

export default App