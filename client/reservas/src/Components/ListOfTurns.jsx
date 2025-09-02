import axios from 'axios';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {DateCalendar} from '@mui/x-date-pickers/DateCalendar'
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import Turns from './Turns';
import './ListOfTurns.css';

const ListOfTurns =  () => {
    
    const [listOfSheets, setListOfSheets] = useState(null);
    const [maxCalendarDate, setMaxCalendarDate] = useState(Date());
    const [calendarValue, setCalendarValue] = useState(dayjs(Date()));

    useEffect(() => {

        axios.get(import.meta.env.VITE_API_URL + "/listSheets", {            
        }).then(async (response) => {
            setListOfSheets(response.data.sheets);
            setMaxCalendarDate(
                getMaxDate(
                    getListOfMonths(response.data.sheets)
                )
            );
        })
    }, []);
  
    const itsAMonth = (month) => {
        const listMonths = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
        return (listMonths.includes(month.toLowerCase()))            
    }

    const getMonthValue = (month) => {
        const listMonths = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
        const checkMonth = (mon) => {
            return mon == month.toLowerCase()
        }
        return (listMonths.findIndex(checkMonth)+1);
    }

    const maxDay = (month, year) => {
        switch (month.toString()){
            case "01":
            case "03":
            case "05":
            case "07":
            case "08":
            case "10":
            case "12":
                return ("31");
                break;
            case "04":
            case "06":
            case "09":
            case "11":
                return ("30");
                break;
            case "02":
                if (year % 400 == 0 || year % 4 == 0 && year % 100 != 0) {
                    return ("29");
                }
                return ("28");
            default:
                return("0");
        }
    }

    const getListOfMonths = (list) => {
        const retList = [];
        list.map((val) => {
            const year = val.slice(val.length - 2);
            const month = val.slice(0, val.length - 2);
            if (Number.isInteger(Number.parseInt(year)) && itsAMonth(month)){
                retList.push(val);
            }
        })
        console.log(retList)
        return (retList)
    }

    const getMaxDate = (list) => {
        let maxDate = list[0];
        let maxMonth = getMonthValue(maxDate.slice(0, maxDate.length - 2));
        let maxYear = maxDate.slice(maxDate.length - 2);
        list.map((val) =>{
            const year = val.slice(val.length - 2);
            const month = getMonthValue(val.slice(0, val.length - 2));
            if (year >= maxYear && month > maxMonth){
                maxDate = val;
                maxMonth = month;
                maxYear = year;
            }
        })
        maxYear = "20" + maxYear;
        if (maxMonth.valueOf() < 10){
            maxMonth = "0" + maxMonth;
        }
        let retDate = maxYear + "-" + maxMonth + "-" + maxDay(maxMonth, maxYear)
        return(retDate) 
    }

    return(
    <>
        <div className="calendar-container">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    value={calendarValue}
                    onChange={(newValue) => setCalendarValue(newValue)}
                    views={['day']} 
                    maxDate={dayjs(maxCalendarDate)}
                    disablePast/>
            </LocalizationProvider>
        </div>
        <>{calendarValue.$D}/{calendarValue.$M}/{calendarValue.$y}</>
        <Turns day={calendarValue.$D} month={calendarValue.$M} year={calendarValue.$y} />
    </>
    )
}

export default  ListOfTurns;