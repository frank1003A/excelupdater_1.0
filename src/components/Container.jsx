import React from "react";
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { IconButton } from "@mui/material";
import Export from "@mui/icons-material/ImportExportRounded";
import Input from "@mui/material/Input";
import { TextField } from "@mui/material";
import { keyboard } from "@testing-library/user-event/dist/keyboard";
import _ from "lodash";
import { BottomNavigation } from "@mui/material";

function Container() {
  const [exceldata, setexceldata] = useState([]);
  const [sheetname, setsheetName] = useState("");
  const [startIndex, setstartIndex] = useState("");

  //read xlsx file and return as html table
  const readExcelFile = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        resolve(data);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      setexceldata(d);
      console.log(d);
    });
  };

  //create new xlsx file and save to pc
  const writeToExcelFile = (fileExtension, fileName) => {
    const table = document.getElementById("tablegen");
    const wb = XLSX.utils.table_to_book(table, { sheet: "sheet1" });
    return XLSX.writeFile(
      wb,
      fileName + "." + fileExtension || "sheetname." + (fileExtension || "xlsx")
    );
  };

  //create new workbook without data
  const createWorkbook = (fileName, fileExtension) => {
    const table = document.getElementById("tablegen");
    const wb = XLSX.utils.book_new();
    return XLSX.writeFile(
      wb,
      fileName + "." + fileExtension || "sheetname." + (fileExtension || "xlsx")
    );
  };

  //modify xlsx file and update existing workbok
  const updateWorkbookTwo = (fileName, fileExtension, file) => {
    /*
      const table = document.getElementById('tablegen')
      const uptdWorksheet = XLSX.utils.table_to_sheet(table)
      return XLSX.utils.book_append_sheet(fileName + "." + fileExtension,  uptdWorksheet, 'sheet2')
      */

    const promise = new Promise((resolve, reject) => {
      checkSheetName(); // check if sheet name is empty

      checkStartPosition(); // check origin cell input

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer" });

        let worksheet = {};

        for (const sheetName of wb.SheetNames)
          worksheet[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets);

        for (let i = 0; i < exceldata.length; i++) {
          const data = {
            Dated: exceldata[i].Date,
            Descriptiond: exceldata[i].Description,
            Nod: exceldata[i].No,
            Amountd: exceldata[i].Amount,
          };
          worksheet[sheetname].push(data);
        }
        //wb.Sheets[sheetname], worksheet[sheetname], { origin: {r : 0, c : exceldata.length - 1}}

        const updatedWs = XLSX.utils.sheet_add_json(
          wb.Sheets[sheetname],
          worksheet[sheetname],
          { origin: startIndex.toUpperCase(), skipHeader: true }
        );
        resolve(updatedWs);

        return XLSX.writeFile(
          wb,
          fileName + "." + fileExtension ||
            "sheetName." + (fileExtension || "xlsx")
        );
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
    promise.then(() => {
      alert("file updated");
    });
  };
  /*
    //match utility functin
    const match = (a) => {
      for(let i = 0; i < a.length; i++){
          for (let j = 0; j < exceldata.length; j++){
              if (a[i].No === exceldata[j].No) {
                imageData.push({
                  'Dated' : exceldata[j].Date, 
                  'Descriptiond': exceldata[j].Description,
                  'Nod': exceldata[j].No, 
                  'Amountd': exceldata[j].Amount})
                  setmatchedData({data: imageData},console.log(imageData))
          }
          }
      }
    }  
    */

  //match data from html table to  workboook
  const matchData = (fileName, fileExtension, file) => {
    const promise = new Promise((resolve, reject) => {
      checkSheetName(); // check if sheet name is empty

      checkStartPosition(); // check origin cell input

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer", cellDates: true });

        let worksheet = {};

        for (const sheetName of wb.SheetNames)
          worksheet[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets);

        //worksheet[sheetname]['!ref'] = "A19:D25"

        //range utility functions
        let A = "A";
        let subR = startIndex.slice(1) - 1;
        let rangeStart = A + subR;
        wb.Sheets[sheetname]["!ref"] = `${rangeStart}:D15`;
        console.log('startIndex', rangeStart)

        const sheet = XLSX.utils.sheet_to_json(wb.Sheets[sheetname], {
          dateNF: "yyyy-mm-dd",
        });
        //sheet['!ref'] = "A10:D15"

        console.log("match from", sheet);

        const matchData = sheet.findIndex((wsData) => {
          for (let i = 0; i < exceldata.length; i++) {
            if (exceldata[i].No === wsData.No) {
              worksheet[sheetname].push({
                Dated: exceldata[i].Date,
                Descriptiond: exceldata[i].Description,
                Nod: exceldata[i].No,
                Amountd: exceldata[i].Amount,
              });
            } else {
              console.log("Not matched");
            }
          }
        });

        while (worksheet[sheetname].length !== sheet.length) {
          worksheet[sheetname].push({
            Dated: "",
            Descriptiond: "",
            Nod: "",
            Amountd: "",
          });
        }
        //map utility function
        const originalLength = worksheet[sheetname].length;

        const provide = (arr, field, index) => {
          let result = arr.filter((a) => a["Nod"] == sheet[index][field]);
          if (result.length == 0) {
            result = arr.filter((a) => a["Nod"] == "");
          }
          return result[0];
        };

        const originalArr = worksheet[sheetname].slice(0, originalLength);

        for (let i = 0; i < sheet.length; i++) {
          worksheet[sheetname].length = originalLength * 2;
          const item = provide(originalArr, "No", i);
          worksheet[sheetname][i] = item;
        }

        worksheet[sheetname].length = originalLength;
        //map utility function end

        console.log("matched", matchData);

        console.log("sheet", worksheet[sheetname]);

        const updatedWs = XLSX.utils.sheet_add_json(
          wb.Sheets[sheetname],
          worksheet[sheetname],
          { origin: startIndex.toUpperCase(), skipHeader: true }
        );
        resolve(updatedWs);

        return XLSX.writeFile(
          wb,
          fileName || "sheetName." + (fileExtension || "xlsx")
        );
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
    promise.then((d) => {
      alert("Data matched and updated");
      //window.location.reload()
    });
  };

  const UpdateLog = ( ) => {
    //log timestamp of file update 
  }

  //order  maper
  const mapOrder = (array, order, key) => {
    array.sort((a, b) => {
      const A = a[key];
      const B = b[key];
      return order.indexOf(A) > order.indexOf(B) ? 1 : -1;
    });
    return array;
  };

  //mactch index
  const matchIndex = (arr, initIndex, finIndex) => {
    arr.splice(finIndex, 0, arr.splice(initIndex));
    console.log(arr);
    return arr;
  };

  //
  const sortArray = (a, b, defaultArr, sortingArr) => {
    defaultArr.sort((a, b) => sortingArr.indexOf(a) - sortingArr.indexOf(b));
  };

  //check start position to end position based on date/week
  const checkStartPosition = () => {
    if (!startIndex || startIndex === null || startIndex === undefined)
      return alert("invalid start position");
  };

  //check sheet name
  const checkSheetName = () => {
    if (!sheetname || sheetname === undefined) {
      return alert(
        "invalid sheet name\n please check that the sheet name exist in excel workbook"
      );
    }
  };

  //create directory for file backup
  const createFileDir = () => {
    let dirName = "Protek_Workbooks";
    /*
      fs.mkdir(dirName, (err) => {
        err ? alert(err) : alert('File Directory' + `${dirName}` + 'created')
      })
      */
  };

  //update workboook
  const updateWorkbook = (fileName, fileExtension) => {
    const table = document.getElementById("tablegen");
    const wb = XLSX.utils.table_to_sheet(table, { sheet: "Sheet1" });
    return XLSX.writeFile(
      wb,
      fileName + "." + fileExtension || "sheetname." + (fileExtension || "xlsx")
    );
  };

  /*
    //filter table data 
    const filterTableData = exceldata.filter((data) => {
        return data.Amount.includes(search) || data.Date.includes(search) || data.Description.includes(search)
    })
    */

  console.log(sheetname);
  console.log(startIndex);
  console.log("pushed:", exceldata);

  return (
    <div>
      <div className="scontainer">
        <label htmlFor="fileToUpdateFrom">Update from: </label>
        <Input
          accept="file"
          id="icon-button-file"
          multiple
          type="file"
          aria-labelledby="update from"
          onChange={(e) => {
            const file = e.target.files[0];
            readExcelFile(file);
          }}
        />

        <label htmlFor="fileToUpdateFrom">Update to: </label>
        <Input
          variant="outlined"
          accept="file"
          id="icon-button-file"
          multiple
          type="file"
          onChange={(e) => {
            const fileTwo = e.target.files[0];
            matchData(fileTwo.name, "xlsx", fileTwo);
          }}
        />

        <TextField
          variant="outlined"
          label="Sheet Name"
          value={sheetname}
          onChange={(e) => setsheetName(e.target.value)}
        ></TextField>
        <TextField
          variant="outlined"
          label="Select cell to begin"
          value={startIndex}
          onChange={(e) => setstartIndex(e.target.value)}
        />
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table" id="tablegen">
          <TableHead sx={{ background: "#eee" }}>
            <TableRow sx={{ color: "white" }}>
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
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
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
  );
}

export default Container;

/**
 * 
 *  <Select labelId="label" id="select" value="Validate photo">
            <MenuItem value="Convert file">Upload photo </MenuItem>
            <MenuItem value="Validate photo">Validate photo </MenuItem>
          </Select>
          
 * <Button variant='text' onClick={() => {
              writeToExcelFile('xlsx', 'Myexport1')
            }} sx={{margin: 'auto'}} > 
            <IconButton><Export  sx={{fontSize: '1rem'}}></Export></IconButton> Export to new excel file
            </Button>

            <Button variant='text' onClick={() => {
              updateWorkbook('Myexportone', 'xlsx')
            }} sx={{margin: 'auto'}} > 
            <IconButton><Export  sx={{fontSize: '1rem'}}></Export></IconButton> update excel file
            </Button>
 * 
      
      let worksheet = {}
        for (const sheetName of wb.SheetNames) worksheet[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

        worksheet.Sheet1.push({...table})  

        const updatedWs = XLSX.utils.sheet_add_json(wb.Sheets["Sheet1"], worksheet.Sheet1) 
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

/*
          for (let i = 0; i < sheet.length; i++){
            if (sheet[i].No !== worksheet[sheetname][i].Nod){
              worksheet[sheetname][i] = sheet[i]
            }
          }*/

/*
            for (let i = 0; i < sheet.length; i++){
              //const tmpv = worksheet[sheetname].findIndex(k => k.Nod === sheet[i].No)
              //const tempValue = sheet.findIndex(j => j.No === worksheet[sheetname][i].Nod)
              //if (sheet[i].No !== worksheet[sheetname][i].Nod || worksheet[sheetname][i] === '') {
                worksheet[sheetname].sort(x => x.Nod === sheet[i].No )
              //console.log(tempValue, tmpv)
            }
            */
//worksheet[sheetname].splice(4,5, 5)

/*
            worksheet[sheetname].sort((a,b) => {
              return sheet.indexOf(a) - sheet.indexOf(b)
            })
            
            /*
            const added = false;
            for(let i=0; i < worksheet[sheetname].length; i++){
              for(let i=0; i < worksheet[sheetname].length; i++){
                if(arr[i].id === obj.id){
                  arr.splice(i,1,obj);
                  added = true;
                  break;
             }
              }
            }
            
            if(!added) arr.push(obj);
            */
// for (let i = 0; i < worksheet[sheetname].length; i++)

/*
            const matchData = sheet.map((m) => {
              for (let i = 0; i < exceldata.length; i++)
              exceldata[i].No === m.No ? worksheet[sheetname].push({
                        'Dated' : exceldata[i].Date, 
                        'Descriptiond': exceldata[i].Description,
                        'Nod': exceldata[i].No, 
                        'Amountd': exceldata[i].Amount
              }) : console.log('No match data')
            })

            /*
             for(let i = 0; i < sheet.length; i++){
              for (let j = 0; j < exceldata.length; j++){
                  if (sheet[i].No === exceldata[j].No) {
                      worksheet[sheetname].push({
                        'Dated' : exceldata[j].Date, 
                        'Descriptiond': exceldata[j].Description,
                        'Nod': exceldata[j].No, 
                        'Amountd': exceldata[j].Amount
                      })
                }
          } }
         */

//wb.Sheets[sheetname], worksheet[sheetname], { origin: {r : 0, c : exceldata.length - 1}}
/* Iterate through each element in the structure */
/*
              let range = { s: { c: 0, r: 18 }, e: { c: 3, r: 23 } };//A1:A5
              let dataRange = [];
              
              for (let R = range.s.r; R <= range.e.r; ++R) { 
                for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: R };
                const data = XLSX.utils.encode_cell(cell_address);
                const xcon = XLSX.utils.sheet_to_json(cell_address)
                dataRange.push(worksheet[xcon]);

                console.log({thidsdata: worksheet[xcon]})
              }}
              */
