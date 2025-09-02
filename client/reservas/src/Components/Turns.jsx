import axios from "axios"
import { useEffect, useState } from "react";

const Turns = ({day, month, year}) => {

const [allTurns, setAllTurns] = useState(null)
const turns = ["10hs","11hs","12hs","13hs","14hs","17hs","18hs"]

useEffect(() => {
    const monthName = getMonthName(month);
    const trunkYear = year-2000

    const params = new URLSearchParams({d:day, sheet: monthName+trunkYear})
    axios.get(import.meta.env.VITE_API_URL + "/getTurns", { 
        params: params
    }).then(async (response) => {
        setAllTurns(response.data.turns[0])
    })
}, [day, month, year])



const getMonthName = (mon) => {
    const listMonthNames =["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    return(listMonthNames[mon])
}

const getTurnStyle = (val) => {
    if (val === ""){
        return ({backgroundColor: "gray"})
    }
    return ({backgroundColor: "pink"})
}

const getTurnButtonStatus = (val) =>{
    if (val === ""){
        return (false)
    }
    return(true)
}

const getColumnByIndex = (index) =>{
    const columns = ["B","C","D","E","F","G","H"];
    return(columns[index])
}

const handleClick = (index) =>{
    const monthName = getMonthName(month);
    const trunkYear = year-2000
    const column = getColumnByIndex(index);

    axios.post(import.meta.env.VITE_API_URL + "/reserve", {
        data:{
            day:day,
            sheet:monthName+trunkYear,
            column:column,
            keyword:"Reservado desde la web"
        }
    }).then(async (response) => {
                if (response.status === 200){
                const buttonID = "b"+index;
                const turnId = "t"+index;
                const targetButton = document.getElementById(buttonID);
                const targetTurn = document.getElementById(turnId);
                targetButton.disabled = true;
                targetTurn.style.backgroundColor = "pink";
            }
        })
}


return(
    <>
    {allTurns && (
    <ul className="listOfTurns">
        {allTurns.map((val, i) => (
            <div className="turn-container" style={getTurnStyle(val)} id={"t"+i} key={i}>
                <div className="turn-info" >{turns[i]}</div>
                <button className="turn-reserve" id={"b"+i} disabled={getTurnButtonStatus(val)}  onClick={() => handleClick(i)}>Reservar</button>
            </div>
        ))}
    </ul>
    )}
    </>
)

}

export default Turns;