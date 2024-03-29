import React from "react";
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { TableBody } from "@mui/material";
import Input from "@mui/material/Input";
import { TextField, Button, Typography } from "@mui/material";
import imgSh from "../assets/455.svg";
import fdsvg from "../assets/Fidelity-Bank-Icon.svg";
import zbpng from "../assets/png/Zenith-bank-logo.png";
import { Paper, FormLabel } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Select, MenuItem } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Modal from "./Modal";
import Checkbox from "@mui/material/Checkbox";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/localStorage";

function Container() {
  const navigate = useNavigate();
  const [islogged, setislogged] = useLocalStorage("isLogin");
  const [dateLogin] = useLocalStorage("dateLogin");

  const checkLogingAndLoginExpiry = () => {
    if (islogged === false) navigate("/login");
  };

  useEffect(() => {
    islogged === true && dateLogin === convert(Date.now())
      ? navigate("/")
      : setislogged(false);
    checkLogingAndLoginExpiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islogged, navigate, dateLogin]);

  const [exceldata, setexceldata] = useState([]);
  const [sheetname, setsheetName] = useState("");
  const [startIndex, setstartIndex] = useState("");
  const [rangeS, setrangeS] = useState("");
  const [rangeE, setrangeE] = useState("");
  const [selectBank, setselectBank] = useState(0);
  const [spAmount, setspAmount] = useState(false);

  /**Modal State */
  const [openNoMatchModal, setopenNoMatchModal] = useState(false);

  //modal method
  const handleOpenModal = () => setopenNoMatchModal(true);
  const handleCloseModal = () => setopenNoMatchModal(false);

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

  /**read xlsx file and return as html table */
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

  /**Match excel data with reference number */
  const matchByRef = (fileName, fileExtension, file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, {
          type: "buffer",
          cellDates: true,
          cellStyles: true,
        });

        let worksheet = {};

        for (const sheetName of wb.SheetNames)
          worksheet[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets);

        const sheet = XLSX.utils.sheet_to_json(wb.Sheets[sheetname], {
          dateNF: "yyyy-mm-dd",
          range: `${rangeS}:${rangeE}`,
          blankrows: true,
          defval: "",
        });

        sheet.findIndex((wsData) => {
          for (let i = 0; i < exceldata.length; i++) {
            if (exceldata[i]["Trans Reference"] === wsData["Reference"]) {
              wsData["TOTAL PAID"] = splitAmount(
                sheet,
                wsData.Reference,
                wsData["TOTAL"],
                exceldata[i].Amount
              );
              wsData.DATE = exceldata[i]["Trans Date"];
              wsData.BALANCE = Math.round(
                Math.abs(
                  wsData["TOTAL PAID"] -
                    (wsData[" TOTAL "] || wsData.TOTAL || wsData["TOTAL"])
                )
              );
              wsData.REMARK = sliceRemarksZenith(exceldata[i].Description);
              wsData.status = `${checkDebt(
                sheet,
                wsData.Reference,
                wsData[" TOTAL "] || wsData.TOTAL || wsData["TOTAL"],
                wsData["TOTAL PAID"]
              )}`;
            }
          }
          return 0;
        });

        const finalSheet = sheet.map((data) => {
          let fdata = {
            "TOTAL PAID": data["TOTAL PAID"],
            DATE: data["DATE"],
            BALANCE: data.BALANCE,
            REMARK: data.REMARK,
            status: data.status,
          };
          return fdata;
        });

        const updatedWs = XLSX.utils.sheet_add_json(
          wb.Sheets[sheetname],
          finalSheet,
          {
            origin: startIndex.toUpperCase(),
            skipHeader: true,
            raw: true,
            cellStyles: true,
          }
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

  /**check for zero match */
  const checkMatch = () => {
    handleOpenModal();
  };

  /**Check if customer overpaid or underpaid */
  const checkDebt = (itemTable, data, topay, paid) => {
    const refCount = checkSplit(itemTable, data);
    const bal = paid - topay;
    let verdict = "";
    topay < paid ? (verdict = "overpaid") : (verdict = "owing");
    if (refCount > 1) verdict = "manual split";
    if (topay === paid) verdict = "paid in full";
    if (bal > 1000) verdict = "overpaid or manual split";
    if (spAmount === true && refCount > 1 && topay === paid)
      verdict = "payment split";
    if (spAmount === true && refCount > 1 && paid > topay)
      verdict = `+${Math.round(bal)} added after split`;
    return verdict;
  };

  /**check and notify of amount split */
  const checkSplit = (itemTable, data) => {
    const count = itemTable.filter((dta) => dta.Reference === data);
    return count.length;
  };

  /**Split amount with same reference */
  const splitAmount = (itemTable, data, toPay, amtPaid) => {
    let amount = amtPaid;
    const num = itemTable.filter((dta) => dta.Reference === data);
    if (num.length > 1 && spAmount === true) {
      const totalSum = Math.round(
        num.reduce((sum, data) => sum + Number(data.TOTAL || 0), 0)
      );
      if (amount > totalSum) {
        const rem = amount - totalSum;
        const lowestTP = num.reduce(
          (lowest, idx) => (lowest = Math.min(idx.TOTAL)),
          0
        );
        toPay > lowestTP
          ? (amount = toPay)
          : (amount = Math.round(toPay + rem));
      }
      if (amount === totalSum) amount = toPay;
    }
    return amount;
  };

  /**Match excel data with generated code */
  const matchByCodeFidelity = (fileName, fileExtension, file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer", cellDates: true });

        let worksheet = {};

        for (const sheetName of wb.SheetNames)
          worksheet[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets);

        const sheet = XLSX.utils.sheet_to_json(wb.Sheets[sheetname], {
          dateNF: "yyyy-mm-dd",
          range: `${rangeS}:${rangeE}`,
        });

        sheet.findIndex((wsData) => {
          for (let i = 0; i < exceldata.length; i++) {
            if (exceldata[i].code === wsData["CODE"]) {
              const dta = {
                "TOTAL PAID": exceldata[i].Amount,
                DATE: exceldata[i]["Transaction Date"],
                BALANCE: Math.round(
                  Math.abs(exceldata[i].Amount - wsData.TOTAL)
                ),
                REMARK: sliceRemarksFidelity(exceldata[i].Details),
                code: exceldata[i].code,
                kilo: wsData.KILO,
                status: `${checkDebt(wsData.TOTAL, exceldata[i].Amount)}`,
              };
              worksheet[sheetname].push(dta);
            } else {
              //do nothing
            }
          }
          return 0;
        });

        if (worksheet[sheetname].length < 1) {
          checkMatch();
          return;
        }

        while (worksheet[sheetname].length !== sheet.length) {
          worksheet[sheetname].push({
            "TOTAL PAID": "",
            DATE: "",
            BALANCE: "",
            REMARK: "",
            code: "",
            status: "",
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
            let rest = result.filter((a) => a.kilo === sheet[index].KILO);
            result[0] = rest[0];
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

        const DSHEET = worksheet[sheetname].map((data) => {
          let info = {
            "TOTAL PAID": data["TOTAL PAID"],
            DATE: data["DATE"],
            BALANCE: data.BALANCE,
            REMARK: data.REMARK,
            status: data.status,
          };
          return info;
        });

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

  /**slice zenith bank description column */
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
    if (text.includes("FBN") && text.includes("/"))
      rep = text.slice(f_dsh + 1, l_dsh);
    if (text.includes("UBN") && text.includes("/"))
      rep = text.slice(f_dsh + 1, l_dsh);
    if (text.includes("ABN") && text.includes("/"))
      rep = text.slice(f_dsh + 1, l_dsh - 4);
    if (text.includes("GTB") && text.includes("/"))
      rep = text.slice(f_dsh + 1, l_dsh);
    return rep;
  };

  /**slice remark fidelity bank */
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
  //update workboook

  const showDataForZenith = exceldata.map((row) => {
    return (
      <TableRow
        key={row.__rowNum__}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {row.__rowNum__}
        </TableCell>
        <TableCell align="center">{row["Trans Reference"]}</TableCell>
        <TableCell align="center">{convert(row["Trans Date"])}</TableCell>
        <TableCell align="center">{row.Amount}</TableCell>
      </TableRow>
    );
  });

  const showtableForZenith = (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table" id="tablegen">
          <TableHead sx={{ background: "#eee" }}>
            <TableRow sx={{ color: "white" }}>
              <TableCell>Id</TableCell>
              <TableCell align="center">Trans Reference</TableCell>
              <TableCell align="center">Trans Date</TableCell>
              <TableCell align="center">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{showDataForZenith}</TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const showDataForFidelity = exceldata.map((row) => {
    return (
      <TableRow
        key={row.__rowNum__}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {row.__rowNum__}
        </TableCell>
        <TableCell align="center">{convert(row["Transaction Date"])}</TableCell>
        <TableCell align="center">{row.Details}</TableCell>
        <TableCell align="center">{row.Amount}</TableCell>
        <TableCell align="center">{row.Balance}</TableCell>
      </TableRow>
    );
  });

  const showtableForFidelity = (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table" id="tablegen">
          <TableHead sx={{ background: "#eee" }}>
            <TableRow sx={{ color: "white" }}>
              <TableCell>Id</TableCell>
              <TableCell align="center">Transaction Date</TableCell>
              <TableCell align="center">Details</TableCell>
              <TableCell align="center">Amount</TableCell>
              <TableCell align="center">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{showDataForFidelity}</TableBody>
        </Table>
      </TableContainer>
    </>
  );

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

  /**Display and match data based on bank: fidelity bank or zenith bank*/
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

  const bankControl = () => {
    if (selectBank === 0) {
      return (
        <>
          <Tooltip title={"Select Bank Excel File"}>
            <Input
              accept="file"
              id="icon-button-file-bank"
              multiple
              disabled={true}
              type="file"
              aria-labelledby="update from"
              onChange={(e) => {
                const file = e.target.files[0];
                readExcelFile(file);
              }}
            />
          </Tooltip>
        </>
      );
    } else {
      return (
        <>
          <Tooltip title={"Select Bank Excel File"}>
            <Input
              accept="file"
              id="icon-button-file-bank"
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
        </>
      );
    }
  };

  const manifestControl = () => {
    if (exceldata.length < 1) {
      return (
        <>
          <Tooltip title={"Select Manifest to update"}>
            <Input
              variant="outlined"
              accept="file"
              id="icon-button-file-manifest"
              multiple
              disabled={true}
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
        </>
      );
    } else {
      return (
        <Tooltip title={"Select Manifest to update"}>
          <Input
            variant="outlined"
            accept="file"
            id="icon-button-file-manifest"
            multiple
            disabled={false}
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
      );
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
              Zenith <img src={zbpng} id="banklogo" alt="zenith logo" />
            </MenuItem>
            <MenuItem value={2}>
              Fidelity
              <img src={fdsvg} id="banklogo" alt="fidelity logo" />
            </MenuItem>
          </Select>
          {bankControl()}
          <Button
            variant="contained"
            sx={{ background: "orange" }}
            onClick={() => {
              setexceldata([]);
            }}
          >
            Clear
          </Button>
          <div
            style={{
              border: "1px solid orange",
              borderRadius: "4px",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Checkbox value={spAmount} onClick={() => setspAmount(!spAmount)} />
            <Typography
              style={{
                color: "ButtonShadow",
                marginRight: "1rem",
                marginTop: ".6rem",
              }}
            >
              Split Payments
            </Typography>
          </div>
        </div>
        <div className="sheetinfo">
          <FormLabel>Manifest Excel Details</FormLabel>
          <div className="inerform">
            {manifestControl()}
            <TextField
              variant="outlined"
              label="Sheet Name"
              value={sheetname}
              onChange={(e) => setsheetName(e.target.value)}
            ></TextField>
            <TextField
              variant="outlined"
              label="Select cell to begin"
              value={startIndex.toUpperCase()}
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
      <div className="dispSheets" style={{ background: "#eee" }}>
        {displayByBank()}
      </div>

      <Modal
        className="formtable"
        OpenModal={openNoMatchModal}
        handleCloseModal={handleCloseModal}
      >
        <p>No data from bank file matches data from manifest</p>
        <label htmlFor="p">Possible Reasons: </label>
        <FormLabel sx={{ textAlign: "left", color: "black" }}>
          Check that your bank file is the intended file you want to use.
        </FormLabel>
        <FormLabel sx={{ textAlign: "left", color: "black" }}>
          Check that your reference numbers or codes are equivalent.
        </FormLabel>
        <FormLabel sx={{ textAlign: "left", color: "black" }}>
          Check that the manifest range, start cell and sheetname is accurate.
        </FormLabel>
        <br />
        <Button
          variant="primary"
          sx={{ background: "orange" }}
          onClick={() => {
            window.location.reload();
          }}
        >
          Continue
        </Button>
      </Modal>

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
