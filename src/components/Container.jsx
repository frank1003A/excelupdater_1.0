import React from "react";
import * as XLSX from "xlsx";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { TableBody } from "@mui/material";
import Input from "@mui/material/Input";
import { TextField, Button } from "@mui/material";
import imgSh from "../assets/tb.svg";
import fdsvg from "../assets/Fidelity-Bank-Icon.svg";
import zbpng from "../assets/png/Zenith-bank-logo.png";
import { Paper, FormLabel } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Select, MenuItem } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

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

        //console.log("match from", sheet);

        sheet.findIndex((wsData) => {
          for (let i = 0; i < exceldata.length; i++) {
            if (exceldata[i]["Trans Reference"] === wsData["Reference"]) {
              let dta = {
                "TOTAL PAID": exceldata[i].Amount,
                DATE: exceldata[i]["Trans Date"],
                BALANCE: `${Math.round(exceldata[i].Amount - wsData.TOTAL)} (${checkDebt(wsData.TOTAL, exceldata[i].Amount)})`,
                REMARK: sliceRemarksZenith(exceldata[i].Description),
                Reference: exceldata[i]["Trans Reference"],
                kilo: wsData.KILO
              };
              worksheet[sheetname].push(dta)
            } else {
              //do nothing
            }
          }
          return 0;
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
          let result = arr.filter((a) => a.Reference === sheet[index][field]);
          if (result.length === 0) {
            result = arr.filter((a) => a.Reference === "");
          }

          if (result[0].Reference > 1) {
            let rest = result.filter((a) => a.kilo === sheet[index].KILO)
            result[0] = rest[0]
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

        const DSHEET = worksheet[sheetname].map(data => {
          let info =  { 
            "TOTAL PAID": data["TOTAL PAID"] ,
            DATE: data['DATE'],
            BALANCE: data.BALANCE,
            REMARK: data.REMARK
          }
          return info
        })

       //console.log("sheetmatch", worksheet[sheetname]);

        const updatedWs = XLSX.utils.sheet_add_json(
          wb.Sheets[sheetname],
          DSHEET,
          { origin: startIndex.toUpperCase(), skipHeader: true, raw: true }
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
        handlewarClick();
      };
    });
    promise.then(() => {
      handlesucClick();
    });
  };

  const checkDebt = (topay, paid) => {
    let verdict = "";
    topay < paid ? (verdict = "overpaid") : (verdict = "owing");
    return verdict;
  };

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

       // console.log("match from", sheet);

        sheet.findIndex((wsData) => {
          for (let i = 0; i < exceldata.length; i++) {
            if (exceldata[i].code === wsData["CODE"]) {
              const dta = {
                "TOTAL PAID": exceldata[i].Amount,
                DATE: exceldata[i]["Transaction Date"],
                BALANCE:  `${Math.round(exceldata[i].Amount - wsData.TOTAL)} (${checkDebt(wsData.TOTAL, exceldata[i].Amount)})`,
                REMARK: sliceRemarksFidelity(exceldata[i].Details),
                code: exceldata[i].code,
                kilo: wsData.KILO
              };
              worksheet[sheetname].push(dta);
            } else {
              //do nothing
            }
          }
          return 0;
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
          let result = arr.filter((a) => a.code === sheet[index][field]);
          if (result.length === 0) {
            result = arr.filter((a) => a.code === "");
          }
          if (result[0].code.length > 1) {
            let rest = result.filter((a) => a.kilo === sheet[index].KILO)
            result[0] = rest[0]
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

        const DSHEET = worksheet[sheetname].map(data => {
          let info =  { 
            "TOTAL PAID": data["TOTAL PAID"] ,
            DATE: data['DATE'],
            BALANCE: data.BALANCE,
            REMARK: data.REMARK
          }
          return info
        })

        //console.log("sheetmatch", worksheet[sheetname]);

        const updatedWs = XLSX.utils.sheet_add_json(
          wb.Sheets[sheetname],
          DSHEET,
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
        handlewarClick();
      };
    });
    promise.then(() => {
      handlesucClick();
    });
  };

  //slice remark zenith
  const sliceRemarksZenith = (text) => {
    const m_idx = text.indexOf("FRM");
    const m_idx2 = text.indexOf("from");
    const m_idx2_cap = text.indexOf("FROM");
    const s_idx = text.indexOf("TO");
    const s_idx2 = text.indexOf("to");
    const f_dsh = text.indexOf("/");
    const l_dsh = text.lastIndexOf("/");
    let rep = "";
    if (text.includes("TRF")) rep = text.slice(m_idx + 3, s_idx);
    if (text.includes("Transfer")) rep = text.slice(m_idx2 + 4, s_idx2);
    if (text.includes("NIP") && !(text.includes("TRF") || text.includes("/")))
      rep = text;
    if (text.includes("NIP") && text.includes("/") && !text.includes("TRF"))
      rep = text.slice(f_dsh + 1, l_dsh);
    if (text.includes("TRANSFER")) rep = text.slice(m_idx2_cap + 4, s_idx2);
    if (text.includes("OPAY")) rep = text.slice(f_dsh + 6, l_dsh);
    if (text.includes("STAMP")) rep = text;
    return rep;
  };

  //slice remark fidelity
  const sliceRemarksFidelity = (text) => {
    const m_idx2 = text.indexOf("from");
    const m_idx2_cap = text.indexOf("FROM");
    let rep = "";
    if (text.includes("Transfer")) rep = text.slice(m_idx2 + 4, text.length);
    if (text.includes("TRANSFER"))
      rep = text.slice(m_idx2_cap + 4, text.length);
    if (text.includes("STAMP")) rep = text;
    if (text.includes(":") && text.includes("TRF")) rep = text;
    if (text.includes(":") && !text.includes("TRF")) rep = text;
    return rep;
  };

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
              <TableCell align="right">
                {convert(row["Transaction Date"])}
              </TableCell>
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
        <div className="desc">
        <p>Table will display here</p>
        </div>
      </div>
    </>
  );

  const displayByBank = () => {
    if (exceldata.length > 0 && selectBank === 1) {
      return showtableForZenith;
    }
    if (exceldata.length > 0 && selectBank === 2) {
      return showtableForFidelity;
    } else {
      return showIcon;
    }
  };

  return (
    <div>
      <div className="scontainer">
        <div className="bankinfo">
          <FormLabel>Bank Excel Details</FormLabel>
          <Select
            labelId="label"
            sx={{ padding: "1.5px 14px" }}
            id="select"
            value={selectBank}
            onChange={(e) => setselectBank(e.target.value)}
          >
            <MenuItem value={0}>Select Bank</MenuItem>
            <MenuItem value={1}>
              Zenith <img src={zbpng} alt="zenith logo" />
            </MenuItem>
            <MenuItem value={2}>
              Fidelity
              <img src={fdsvg} alt="fidelity logo" />
            </MenuItem>
          </Select>

          <Tooltip title={"Select Bank Excel File"}>
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
          </Tooltip>

          <Button
            variant="contained"
            onClick={() => {
              setexceldata([]);
            }}
          >
            Clear
          </Button>
        </div>
        <div className="sheetinfo">
          <FormLabel>Manifest Excel Details</FormLabel>
          <div className="inerform">
            <Tooltip title={"Select Manifest to update"}>
              <Input
                variant="outlined"
                accept="file"
                id="icon-button-file"
                multiple
                type="file"
                onChange={(e) => {
                  const fileTwo = e.target.files[0];
                  if (selectBank === 1) {
                    matchByRef(
                      `manifest ${convert(new Date(Date.now()))}`,
                      "xlsx",
                      fileTwo
                    );
                  } else if (selectBank === 2) {
                    matchByCodeFidelity(
                      `manifest ${convert(new Date(Date.now()))}`,
                      "xlsx",
                      fileTwo
                    );
                  }
                }}
              />
            </Tooltip>
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
        </div>
      </div>
      <div className="dispSheets">{displayByBank()}</div>

      <Snackbar
        open={opensuccess}
        autoHideDuration={6000}
        onClose={handlesucClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

/**if ((num > 1) && (amount > totalTP)) {
      const rem = itemTable.reduce((dv, value) => (dv = dv - value.TOTAL),amount); //remainder
      console.log(rem)
      const lowestTP = itemTable.reduce((lowest, idx) => (lowest = Math.min(idx.TOTAL)),0);
      console.log(lowestTP)
      toPay > lowestTP ? paid = toPay : paid = Math.round(toPay + rem);
    } */
