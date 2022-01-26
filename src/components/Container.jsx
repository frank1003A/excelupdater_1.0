import React from "react";
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Button } from "@mui/material";
import { IconButton } from "@mui/material";
import Export from "@mui/icons-material/ImportExportRounded";
import Input from "@mui/material/Input";
import { TextField } from "@mui/material";
import { keyboard } from "@testing-library/user-event/dist/keyboard";
import SpeedDial from './SpeedDial'
import PaperC from './SpeedDial'
import { getOverlappingDaysInIntervals } from "date-fns";
import TabPanel from './TabPanel'
import imgSh from '../assets/ss2.svg'
import Tabpanel from './TabPanel'
import { Paper } from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import LinearWithValueLabel from "./Linearlabel";
import Backdrop from './Backdrop'


function Container() {
  const [exceldata, setexceldata] = useState([]);
  const [sheetname, setsheetName] = useState("");
  const [startIndex, setstartIndex] = useState("");
  const [rangeS, setrangeS] = useState('')
  const [rangeE, setrangeE] = useState('')
  const [sheetData, setsheetData] =  useState([])
  const [matchedData, setmatchedData] = useState([])
  const [showT, setshowT] = useState(false);

   /**Backdrop */
   const [open, setOpen] = useState(false);
   const handleClose = () => {
     setOpen(false);
   };
   const handleToggle = () => {
     setOpen(!open);
   };
   /**Backdrop end*/


  /**Snackbar */
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [opensuccess, setOpensuccess] = useState(false);
  const [openwarn, setOpenwarn] = useState(false)

  const handlesucClick = () => {
    setOpensuccess(true);
  };

  const handlewarClick = () => {
    setOpenwarn(true);
  };

  const handlesucClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpensuccess(false);
  };

  const handlewarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenwarn(false);
  };


  //read xlsx file and return as html table
  const readExcelFile = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer", cellDates: true, dateNF: 'yyyy-mm-dd'});

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
      if (d.code === ('' || undefined || null)){ 
        //do nothing
      }else { return setexceldata(d);}
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
          const bala = 'N/A'
          const data = {
            Amountd: exceldata[i].Amount,
            Dated: exceldata[i]['Trans Date'],
            Balance: exceldata[i][bala],
            Descriptiond: exceldata[i].Description,
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

  //match data from html table to  workboook
  const matchData = (fileName, fileExtension, file) => {
    const promise = new Promise((resolve, reject) => {
      checkSheetName();     /** checks if sheet name is empty */

      checkStartPosition(); //check origin cell input  
    
      checkRange() //Stops user from choosing a range of Ax as start position

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer", cellDates: true });

        let worksheet = {};

        for (const sheetName of wb.SheetNames)
          worksheet[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets);

       //wb.Sheets[sheetname]["!ref"] = "A2:P40"; 
       // wb.Sheets[sheetname]["!ref"] = getRange()
       //sheet['!ref'] = "M3:P50"

        const sheet = XLSX.utils.sheet_to_json(wb.Sheets[sheetname], {
          dateNF: "yyyy-mm-dd", range: `${rangeS}:${rangeE}`
        });

        console.log("match from", sheet);

        const matchData = sheet.findIndex((wsData) => {
          for (let i = 0; i < exceldata.length; i++) {
            if (exceldata[i].code === wsData['CODE']) {
              const dta = { 
                'TOTAL PAID': exceldata[i].Amount,
                'DATE': exceldata[i]['Trans Date'],
                'BALANCE': exceldata[i].Amount,
                'REMARK': exceldata[i].Description,
                'CODE':exceldata[i].code
              }
              worksheet[sheetname].push(dta);
            }
            else {
              //do nothing
            }
          }
        });
        

        while (worksheet[sheetname].length !== sheet.length) {
          worksheet[sheetname].push({
            'TOTAL PAID': '',
            'DATE': '',
            'BALANCE':'',
            'REMARK': '',
            'CODE':''
          });
        }

        //map utility function

        const originalLength = worksheet[sheetname].length;

        const provide = (arr, field, index) => {
          let result = arr.filter((a) => a["CODE"] === sheet[index][field]);
          if (result.length === 0) {
            result = arr.filter((a) => a["CODE"] === "");
          }
          return result[0];
        };


        const originalArr = worksheet[sheetname].slice(0, originalLength);

        for (let i = 0; i < sheet.length; i++) {
          worksheet[sheetname].length = originalLength * 2;
          const item = provide(originalArr, "CODE", i);
          worksheet[sheetname][i] = item;
        }

        worksheet[sheetname].length = originalLength;
        //map utility function end
      
        console.log("sheetmatch", worksheet[sheetname]);
        
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
        handlewarClick()
      };
    });
    promise.then((d) => {
      handlesucClick();
    });
  };


  /*
  const getRange = (wbsheet) => {
    const range = wbsheet.filter(range => range === "")
    if (range){
      //do nothing
    }else { return(
      wbsheet
    )}
  }
  */


  /*
  const UpdateLog = () => {
    //log timestamp of file update
  };
  const getRange = () => {
    // range start
    let A = "A";
    let subR = startIndex.slice(1) - 1;
    let rangeStart = A + subR;

    //range end
    let prefix = startIndex.slice(0, 1);
    let num = startIndex.slice(1);

    const Alpha = Array.from(Array(26)).map((e, i) => i + 65);
    const alphabet = Alpha.map((x) => String.fromCharCode(x));

    for (const key in alphabet)
      prefix.toUpperCase() === alphabet[key] ? prefix = alphabet[key - 1] : console.log("Invalid value");

    let calc = Number(num) + (10 - 1);

    let rangeEnd = prefix + calc.toString();

    //setrangeS(rangeStart)
    //setrangeE(rangeEnd)

    //final range 
    let Range = `${rangeStart}:${rangeEnd}`
    return Range
  };
  */
  


  //check start population position
  const checkStartPosition = () => {
    if (!startIndex || startIndex === null || startIndex === undefined)
      return alert("invalid start position");
  };

  //check valid range for match and update: this only takes effect when matching updates
  const checkRange = () => {
    const r = startIndex.slice(0, 1); // A or a
    if (r === ("a" || "A"))
      return alert("invalid range\n select a range from Bx-Zx");
  }

  //check sheet name
  const checkSheetName = () => {
    if (!sheetname || sheetname === undefined) {
      return alert('Invalid Sheet Name\nPlease confirm that sheet name exist')
  };
  }

  //create directory for file backup
  const createFileDir = () => {
    let dirName = "Mapsheet_Workbooks";
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

  const showtable = exceldata.map((row) => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table" id="tablegen">
          <TableHead sx={{ background: "#eee" }}>
            <TableRow sx={{ color: "white" }}>
              <TableCell>Id</TableCell>
              <TableCell align="right">Trans Reference</TableCell>
              <TableCell align="right">Trans Date</TableCell>
              <TableCell align="right">code</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableRow
        key={row.__rowNum__}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {row.__rowNum__}
        </TableCell>
        <TableCell align="right">{row['Trans Reference']}</TableCell>
                <TableCell align="right">{row['Trans Date'].toString()}</TableCell>
                <TableCell align="right">{row['code']}</TableCell>
                <TableCell align="right">{row.Amount}</TableCell>

      </TableRow>
        </Table>
        </TableContainer>
    )})

    const showIcon = <>
    <div className="UIco">
    <img src={imgSh} alt="icon" style={{ height: '300px', padding: '6rem', }} />
    <br />
    <Button variant="contained"  style={{background:'orange'}} onClick={showtable}>View Table</Button>
    <br />
    <p>
      Select two excel files, One to update from, another to update to, 
      we will match their data and update file of choice
      </p>
    </div>
    </>

    const checkInput = () =>{
      if (!(sheetname && startIndex)){
        return(
          <>
          <Input
          accept="file"
          id="icon-button-file"
          multiple
          disabled={true}
          type="file"
          aria-labelledby="update from"
          onChange={(e) => {
            const file = e.target.files[0];
            readExcelFile(file);
          }}
        />

        <Input
        variant="outlined"
        accept="file"
        id="icon-button-file"
        multiple
        disabled={true}
        type="file"
        onChange={(e) => {
          const fileTwo = e.target.files[0];
          matchData(fileTwo.name, "xlsx", fileTwo);
        }}
      />
          </>
          
        )
      }
      else{ return(
        <>
        <Input
          accept="file"
          id="icon-button-file"
          multiple
          disabled={false}
          type="file"
          aria-labelledby="update from"
          onChange={(e) => {
            const file = e.target.files[0];
            readExcelFile(file);
          }}
        />

        <Input
          variant="outlined"
          accept="file"
          id="icon-button-file"
          multiple
          disabled={false}
          type="file"
          onChange={(e) => {
            const fileTwo = e.target.files[0];
            matchData(fileTwo.name, "xlsx", fileTwo);
          }}
        />
        </>
      )}
    }
    

  return (
    <div>
      <div className="scontainer">
        {checkInput()}

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

        <TextField
          variant="outlined"
          label="start range"
          value={rangeS}
          onChange={(e) => setrangeS(e.target.value)}
        />
        <TextField
          variant="outlined"
          label="end range"
          value={rangeE}
          onChange={(e) => setrangeE(e.target.value)}
        />
      </div>
      <div className="dispSheets" style={{display: 'flex'}}>
    
      </div>
      {exceldata.length > 0 ? showtable : showIcon }


          <Snackbar open={opensuccess} autoHideDuration={4000} onClose={handlesucClose} anchorOrigin={{vertical: 'center', horizontal:'center'}}>
        <Alert onClose={handlesucClose} severity="success" sx={{ width: '100%', height: '100%' }}>
          Data Match Successfull!
        </Alert>
      </Snackbar>

      <Snackbar open={openwarn} autoHideDuration={4000} onClose={handlewarClose} anchorOrigin={{vertical: 'top', horizontal:'right'}}>
        <Alert onClose={handlewarClose} severity="warning" sx={{ width: '100%' }}>
          Invalid Data!
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleClose}
      >
        <Backdrop color="inherit" />
      </Backdrop>
    </div>
  );
}



export default Container;

/**
 * {exceldata.length > 0 ? showtable : showIcon }
 <TextField
          variant="outlined"
          label="start range"
          value={rangeS}
          onChange={(e) => setstartIndex(e.target.value)}
        />
        <TextField
          variant="outlined"
          label="end range"
          value={rangeE}
          onChange={(e) => setstartIndex(e.target.value)}
        />

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
