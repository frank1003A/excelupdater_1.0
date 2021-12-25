import React from 'react'
import * as XLSX from 'xlsx'
import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import { IconButton } from '@mui/material';
import Export from '@mui/icons-material/ImportExportRounded'
import Input from '@mui/material/Input'

function Container() {

    const [exceldata, setexceldata] = useState([])
    const [date, setdate] = useState(new Date())
    const [filterData, setfilterData] = useState([])

    //read xlsx file and return as html table 
    const readExcelFile = (file) => {
        const promise = new Promise((resolve,reject) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file)

            fileReader.onload = (e) => {
                const bufferArray = e.target.result
                const wb = XLSX.read(bufferArray, {type: 'buffer'})

                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data =XLSX.utils.sheet_to_json(ws)
                resolve(data)
            };
            fileReader.onerror = (error) => {
                reject(error)
            }
        })

        promise.then((d) => {
            setexceldata(d)
            console.log(d)
        })
    }

    //select worksheet name
    //select start cell based on date 

    //create new xlsx file and save to pc 
    const writeToExcelFile = (fileExtension, fileName) => {
      const table = document.getElementById('tablegen')
      const wb = XLSX.utils.table_to_book(table, {sheet: 'sheet1'})
      return XLSX.writeFile(wb, fileName + "." + fileExtension ||('sheetname.' + (fileExtension || 'xlsx')))
    }

    //modify xlsx file and save 
    const updateWorkbookTwo = (fileName, fileExtension, file) => {
      /*
      const table = document.getElementById('tablegen')
      const uptdWorksheet = XLSX.utils.table_to_sheet(table)
      return XLSX.utils.book_append_sheet(fileName + "." + fileExtension,  uptdWorksheet, 'sheet2')
      */

      const promise  = new Promise((resolve, reject) => {
        const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file)
            const table = document.getElementById('tablegen')

            fileReader.onload = (e) => {
              const bufferArray = e.target.result
              const wb = XLSX.read(bufferArray, {type: 'buffer'})

              let worksheet = {}
              for (const sheetName of wb.SheetNames) worksheet[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

              worksheet.Sheet1.push({'New row': 'test data' })
              const updatedWs = XLSX.utils.sheet_add_json(wb.Sheets["Sheet1"], worksheet.Sheet1)
              resolve(updatedWs)
              return XLSX.writeFile(wb, fileName + "." + fileExtension ||('sheetname.' + (fileExtension || 'xlsx')))
            };
            fileReader.onerror = (error) => {
              reject(error)
          }
      })
          promise.then(() => {
            alert('file updated')
          })
    }

    const [id, setid] = useState(0)

    const getId = () => {
      for (let i = 0; i < 200; i++){
        setid(Math.floor(Math.random() * 10000) + i)
      }
      return id
    }

    //filter table data 
    const filterTableData = () => {
      exceldata.filter((data) => {
        const newAmt = {
        Amount: data.Amount > 1000,
        };
        setfilterData(newAmt)
        return console.log(filterData)
      })
    }

    //format date


    return (
        <div>
          <div className="scontainer">

          <Input accept="file" id="icon-button-file" multiple type="file" onChange={(e) => {
                const file = e.target.files[0];
                readExcelFile(file)}}/>

            <Button variant='text' onClick={() => {
              writeToExcelFile('xlsx', 'Myexport1')
            }} sx={{margin: 'auto'}} > 
            <IconButton><Export  sx={{fontSize: '1rem'}}></Export></IconButton> Export to new excel file
            </Button>

            <Input accept="file" id="icon-button-file" multiple type="file"style={{marginLeft: '1rem'}}
             onChange={(e) => {
              const  fileTwo = e.target.files[0]
              updateWorkbookTwo(fileTwo.name, 'xlsx', fileTwo)
            }}/>

          </div>
            <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table" id='tablegen' >
        <TableHead sx={{background: '#eee'}}>
          <TableRow sx={{color: 'white'}}>
            <TableCell>Id</TableCell>
            <TableCell align="right">Date</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">No</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {exceldata.map((row) => (
            <TableRow
              key={row.__rowNum__}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.__rowNum__}
              </TableCell>
              <TableCell align="right">{row.Date}</TableCell>
              <TableCell align="right">{row.Description}</TableCell>
              <TableCell align="right">{row.No}</TableCell>
              <TableCell align="right">{row.Amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer> 
        </div>
    )
}

export default Container


/**
 * 
 * /*
    const movePagePosition = () => {
      const scrollLength = 100
      for (let i = 0; i < scrollLength; i++){
        if (scrollY > 0 || scrollY == scrollLength ){
          scrollY === 0;
        }else{
          if (scrollY < 0 || scrollY === 0)
          scrollY === 100;
        }
      }
    }
    
    const table = document.getElementById('tablegen')

      let worksheets = {}
      const wb = XLSX.read(fileName + "." + fileExtension)

      for (const sheetNames of wb.SheetNames){
        worksheets[sheetNames] = XLSX.utils.sheet_to_json(wb.Sheets[sheetNames])
      }

      console.log('json:/n', JSON.stringify(worksheets.sheet1), '/n/n')

      worksheets.sheet1.push({...worksheets, 'New row': 'test'})

      XLSX.utils.sheet_add_json(wb.Sheets['sheet1'], worksheets.sheet1 )
  
      return XLSX.writeFile(wb, fileName + "." + fileExtension ||('sheetname.' + (fileExtension || 'xlsx')))
 */