import React from "react";
import * as XLSX from "xlsx";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Button, TableBody } from "@mui/material";
import Input from "@mui/material/Input";
import { TextField } from "@mui/material";
import imgSh from "../assets/ss2.svg";
import fdsvg from "../assets/Fidelity-Bank-Icon.svg"
import zbpng from "../assets/png/Zenith-bank-logo.png"
import { Paper } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Select, MenuItem } from "@mui/material";

function Container() {
  const [exceldata, setexceldata] = useState([]);
  const [sheetname, setsheetName] = useState("");
  const [startIndex, setstartIndex] = useState("");
  const [rangeS, setrangeS] = useState("");
  const [rangeE, setrangeE] = useState("");
  const [selectBank, setselectBank] = useState(0);

  /**Snackbar */
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [opensuccess, setOpensuccess] = useState(false);
  const [openwarn, setOpenwarn] = useState(false);

  const handlesucClick = () => {
    setOpensuccess(true);
  };

  const handlewarClick = () => {
    setOpenwarn(true);
  };

  const handlesucClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpensuccess(false);
  };

  const handlewarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenwarn(false);
  };

   //date format
   const convert = (str) => {
    let date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    //return [date.getFullYear(), mnth, day].join("-");
    return [mnth, day, date.getFullYear()].join("/");
  };

  //read xlsx file and return as html table
  const readExcelFile = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, {
          type: "buffer",
          cellDates: true,
          dateNF: "yyyy-mm-dd",
        });

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
      if (d.code === ("" || undefined || null)) {
        //do nothing
      } else {
        return setexceldata(d);
      }
    });
  };

  //match data from html table to  workboook
  /*
  const matchData = (fileName, fileExtension, file) => {
    const promise = new Promise((resolve, reject) => {
      checkSheetName(); //check if sheetname is empty
      checkStartPosition(); //check origin cell input

      checkRange(); //Stops user from choosing a range of Ax as start position

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
          dateNF: "yyyy-mm-dd",
          range: `${rangeS}:${rangeE}`,
        });

        console.log("match from", sheet);


          sheet.findIndex((wsData) => {
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
            return 0
          });

        while (worksheet[sheetname].length !== sheet.length) {
          worksheet[sheetname].push({
            "TOTAL PAID": "",
            DATE: "",
            BALANCE: "",
            REMARK: "",
            CODE: "",
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
          fileName + "." + fileExtension || "sheetName." + (fileExtension || "xlsx")
        );
      };
      fileReader.onerror = (error) => {
        reject(error);
        handlewarClick();
      };
    });
    promise.then(() => {
      handlesucClick();
    });
  };
  */

  const matchByRef = (fileName, fileExtension, file) => {
    const promise = new Promise((resolve, reject) => {
      checkSheetName(); /** checks if sheet name is empty */

      checkStartPosition(); //check origin cell input

      checkRange(); //Stops user from choosing a range of Ax as start position

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
          dateNF: "yyyy-mm-dd",
          range: `${rangeS}:${rangeE}`,
        });

        console.log("match from", sheet);


        sheet.findIndex((wsData) => {
            for (let i = 0; i < exceldata.length; i++) {
              if (exceldata[i]['Trans Reference'] === wsData['Reference']) {
                  const dta = { 
                    'TOTAL PAID': exceldata[i].Amount,
                    'DATE': exceldata[i]['Trans Date'],
                    'BALANCE': exceldata[i].Amount,
                    'REMARK': exceldata[i].Description,
                    'Reference':exceldata[i]['Trans Reference']
                  }
                  worksheet[sheetname].push(dta);
              }
              else {
                //do nothing
              }
            }
            return 0
          });

        while (worksheet[sheetname].length !== sheet.length) {
          worksheet[sheetname].push({
            "TOTAL PAID": "",
            DATE: "",
            BALANCE: "",
            REMARK: "",
            Reference: "",
          });
        }

        //map utility function

        const originalLength = worksheet[sheetname].length;

        const provide = (arr, field, index) => {
          let result = arr.filter((a) => a["Reference"] === sheet[index][field]);
          if (result.length === 0) {
            result = arr.filter((a) => a["Reference"] === "");
          }
          return result[0];
        };

        const originalArr = worksheet[sheetname].slice(0, originalLength);

        for (let i = 0; i < sheet.length; i++) {
          worksheet[sheetname].length = originalLength * 2;
          const item = provide(originalArr, "Reference", i);
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
          fileName + "." + fileExtension || "sheetName." + (fileExtension || "xlsx")
        );
      };
      fileReader.onerror = (error) => {
        reject(error);
        handlewarClick();
      };
    });
    promise.then(() => {
      handlesucClick();
    });
  }

  const matchByCodeFidelity = (fileName, fileExtension, file) => {
    const promise = new Promise((resolve, reject) => {
      checkSheetName(); /** checks if sheet name is empty */

      checkStartPosition(); //check origin cell input

      checkRange(); //Stops user from choosing a range of Ax as start position

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
          dateNF: "yyyy-mm-dd",
          range: `${rangeS}:${rangeE}`,
        });

        console.log("match from", sheet);


      sheet.findIndex((wsData) => {
            for (let i = 0; i < exceldata.length; i++) {
              if (exceldata[i].code === wsData['CODE']) {
                const dta = { 
                  'TOTAL PAID': exceldata[i].Amount,
                  'DATE': exceldata[i]["Transaction Date"],
                  'BALANCE': exceldata[i].Balance,
                  'REMARK': exceldata[i].Details,
                  'code':exceldata[i].code
                }
                worksheet[sheetname].push(dta); 
              }
              else {
                //do nothing
              }
            }
            return 0
          });

        while (worksheet[sheetname].length !== sheet.length) {
          worksheet[sheetname].push({
            "TOTAL PAID": "",
            DATE: "",
            BALANCE: "",
            REMARK: "",
            code: "",
          });
        }

        //map utility function

        const originalLength = worksheet[sheetname].length;

        const provide = (arr, field, index) => {
          let result = arr.filter((a) => a["code"] === sheet[index][field]);
          if (result.length === 0) {
            result = arr.filter((a) => a["code"] === "");
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
          fileName + "." + fileExtension || "sheetName." + (fileExtension || "xlsx")
        );
      };
      fileReader.onerror = (error) => {
        reject(error);
        handlewarClick();
      };
    });
    promise.then(() => {
      handlesucClick();
    });
  }

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
  };

  //check sheet name
  const checkSheetName = () => {
    if (!sheetname || sheetname === undefined) {
      return alert("Invalid Sheet Name\nPlease confirm that sheet name exist");
    }
  };

  //update workboook

  const showtableForZenith = exceldata.map((row) => {
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
          <TableBody>
          <TableRow
            key={row.__rowNum__}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              {row.__rowNum__}
            </TableCell>
            <TableCell align="right">{row["Trans Reference"]}</TableCell>
            <TableCell align="right">{convert(row["Trans Date"])}</TableCell>
            <TableCell align="right">{row["code"]}</TableCell>
            <TableCell align="right">{row.Amount}</TableCell>
          </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  });

  const showtableForFidelity = exceldata.map((row) => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table" id="tablegen">
          <TableHead sx={{ background: "#eee" }}>
            <TableRow sx={{ color: "white" }}>
              <TableCell>Id</TableCell>
              <TableCell align="right">Transaction Date</TableCell>
              <TableCell align="right">Details</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          <TableRow
            key={row.__rowNum__}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              {row.__rowNum__}
            </TableCell>
            <TableCell align="right">{convert(row["Transaction Date"])}</TableCell>
            <TableCell align="right">{row.Details}</TableCell>
            <TableCell align="right">{row.Amount}</TableCell>
            <TableCell align="right">{row.Balance}</TableCell>
          </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  });

  const showIcon = (
    <>
      <div className="UIco">
        <img
          src={imgSh}
          alt="icon"
          style={{ height: "300px", padding: "6rem" }}
        />
        <br />
        <Button
          variant="contained"
          style={{ background: "orange" }}
        >
          View Table
        </Button>
        <br />
        <p>
          Select two excel files, One to update from, another to update to, we
          will match their data and update file of choice
        </p>
      </div>
    </>
  );

 

  const checkInput = () => {
    if (!(sheetname && startIndex && rangeS && rangeE && selectBank)) {
      return (
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
              if (selectBank === 1 ) {
                matchByRef( `manifest ${convert(new Date(Date.now()))}`, "xlsx", fileTwo) 
              }else if (selectBank === 2){
                matchByCodeFidelity( `manifest ${convert(new Date(Date.now()))}`, "xlsx", fileTwo) 
              }
            }}
          />
        </>
      );
    } else {
      return (
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
              if (selectBank === 1 ) {
                matchByRef( `manifest ${convert(new Date(Date.now()))}`, "xlsx", fileTwo) 
              }else if (selectBank === 2){
                matchByCodeFidelity( `manifest ${convert(new Date(Date.now()))}`, "xlsx", fileTwo) 
              }
            }}
          />
        </>
      );
    }
  };

  const displayByBank = () => {
    if (exceldata.length > 0 && selectBank === 1) { 
    return showtableForZenith
    }
    if (exceldata.length > 0 && selectBank === 2)  {
      return showtableForFidelity
    }
    else {
      return showIcon
    }
  }

  return (
    <div>
      <div className="scontainer">
      <Select labelId="label" sx={{padding:"1.5px 14px"}} id="select" value={selectBank} onChange={(e) => setselectBank(e.target.value)}>
            <MenuItem value={0}>Select Bank</MenuItem>
            <MenuItem value={1}>Zenith <img src={zbpng} alt="zenith logo" /></MenuItem>
            <MenuItem value={2}>Fidelity<img src={fdsvg} alt="fidelity logo" /></MenuItem>
          </Select>

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
          value={rangeS.toUpperCase()}
          onChange={(e) => setrangeS(e.target.value)}
        />
        <TextField
          variant="outlined"
          label="end range"
          value={rangeE.toUpperCase()}
          onChange={(e) => setrangeE(e.target.value)}
        />

      </div>
      <div className="dispSheets" style={{ display: "flex" }}></div>
      {displayByBank()}

      <Snackbar
        open={opensuccess}
        autoHideDuration={4000}
        onClose={handlesucClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handlesucClose}
          severity="success"
          sx={{ width: "100%", height: "100%" }}
        >
          Data Match Successfull!
        </Alert>
      </Snackbar>

      <Snackbar
        open={openwarn}
        autoHideDuration={4000}
        onClose={handlewarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handlewarClose}
          severity="warning"
          sx={{ width: "100%" }}
        >
          Invalid Data!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Container;

/**const dta = { 
                    'TOTAL PAID': exceldata[i].Amount,
                    'DATE': exceldata[i]["Transaction Date"],
                    'BALANCE': exceldata[i].Balance,
                    'REMARK': exceldata[i].Details,
                    'code':exceldata[i].code
                  }
                  worksheet[sheetname].push(dta); */