import { MenuItem, Select, SelectChangeEvent } from "@mui/material"
import Navbar from "./components/Navbar"
import { useEffect, useState } from "react"


const App = () => {
  const [authToken, setAuthToken] = useState<string>('')
  const [numOfPeople, setNumOfPeople] = useState<number>(2)
  const numOfPeopleRange = [2, 3, 4, 5, 6, 7, 8] // reservations are only allowed for parties of 2 up to 8

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
      <Select
        defaultValue={numOfPeople.toString()}
        value={numOfPeople.toString()}
        onChange={onSelectChange}
      >
        {numOfPeopleRange.map(num => (
          <MenuItem key={num} value={num}>{`${num} people`}</MenuItem>
        ))}
      </Select>
    </div>
  )
}

export default App