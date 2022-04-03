import React from "react";
import { Grid, Avatar, TextField, Button } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import useLocalStorage from "../hooks/localStorage";

const LoginForm = () => {
  const navigate = useNavigate();
  const paperStyle = {
    padding: "20px",
    height: "80vh",
    width: "380px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };
  const avatarStyle = { backgroundColor: "orange" };
  const btnstyle = { margin: "8px 0", background: "orange" };
  const [Org, setOrg] = useState("");
  const [Pass, setPass] = useState("");

  const passcode = {
    Organization: "marybeth&cyto",
    Password: "bridges",
  };

  const [logInCredentials, setlogInCredentials] = useLocalStorage(
    "LoginCredentials",
    []
  );
  const [islogged, setislogged] = useLocalStorage("isLogin", false);

  const assignLogInCred = () => {
    if (islogged === true) navigate("/");
    if (islogged === false || islogged === (undefined || null)) 
     setlogInCredentials(passcode);
  }

  useEffect(() => {
    assignLogInCred();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**Snackbar */
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [opensuccess, setOpensuccess] = useState(false); //snackbar state

  const handlesucClick = () => {
    setOpensuccess(true);
  };

  const handlesucClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpensuccess(false);
  };

  const onSubmit = () => {
    if (
      Org === logInCredentials.Organization &&
      Pass === logInCredentials.Password
    ) {
      setislogged(true);
      navigate("/");
    }
    if (
      Org !== logInCredentials.Organization ||
      Pass !== logInCredentials.Password
    )
    {
      handlesucClick();
    }
  };

  return (
    <Grid
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#eee",
      }}
    >
      <div style={paperStyle}>
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <LockOutlinedIcon />
          </Avatar>
          <h2>Sign In</h2>
        </Grid>
        <TextField
          label="Organization"
          placeholder="Enter Organiztion"
          fullWidth
          required
          value={Org}
          onChange={(e) => setOrg(e.target.value)}
        />
        <TextField
          label="Password"
          placeholder="Enter password"
          type="password"
          sx={{ marginTop: 3 }}
          fullWidth
          required
          value={Pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <br />

        <br />
        <Button
          type="submit"
          variant="contained"
          style={btnstyle}
          fullWidth
          onClick={() => onSubmit()}
        >
          Sign in
        </Button>
        <br />
      </div>

      <Snackbar
        open={opensuccess}
        autoHideDuration={6000}
        onClose={handlesucClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handlesucClose}
          severity="warning"
          sx={{ width: "100%", height: "100%" }}
        >
          Incorrect Credentials
        </Alert>
      </Snackbar>
    </Grid>

    //#1bbd7e
  );
};

export default LoginForm;
