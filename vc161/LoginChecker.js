import { useEffect, useState } from "react";
import { getFire, loginGoogle } from "../vfx-others/ENFire";
// import { CState } from "./CState";

export function LoginChecker({ children }) {
  // profile

  let [mode, setMode] = useState("loading");

  useEffect(() => {
    // getFir();

    return getFire()
      .auth()
      .onAuthStateChanged((s) => {
        if (s) {
          if (!s.isAnonymous) {
            setMode("open");
          } else {
            getFire().auth().signOut();
            setMode("login");
          }
        } else {
          console.log(s);
          setMode("login");
        }
      });
  });

  return (
    <>
      {/*  */}
      {mode === "open" && children}
      {mode === "loading" && <Loading></Loading>}
      {mode === "login" && <LoginPage></LoginPage>}
      {/*  */}
    </>
  );
}

export function AdminChecker({ children }) {
  let [mode, setMode] = useState("loading");
  useEffect(() => {
    //
    getFire()
      .database()
      .ref("/testAdmin")
      .set(Math.random())
      .then(
        () => {
          setMode("ok");
        },
        () => {
          setMode("norights");
        }
      );
  }, []);

  return (
    <>
      {mode === "ok" && children}
      {mode === "loading" && <Loading></Loading>}
      {mode === "norights" && <AccessDenied></AccessDenied>}
    </>
  );
}

function AccessDenied() {
  return (
    <div className="bg-white bg-opacity-95 h-full w-full">
      <div
        className="bg-red-300 text-red-800 flex items-center justify-center text-lg"
        style={{ height: "56px" }}
      >
        Access Denied
      </div>
      {/* <div
        className="ml-4 flex items-center absolute top-0 left-0"
        style={{ height: `56px` }}
        onClick={() => {
          getFire().auth().signOut();
        }}
      >
        Logout
      </div> */}
      <div
        className=" flex items-center justify-center"
        style={{ height: `calc(100% - 56px)` }}
      >
        {/*  */}
        <div>
          <div>Your ID Cannot Access CMS</div>
          <div
            onClick={() => {
              loginGoogle();
            }}
            className="p-3 bg-blue-500 text-white px-6 rounded-full cursor-pointer"
          >
            Login with Google
          </div>
        </div>
      </div>
      <div>{/*  */}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="bg-white bg-opacity-95 h-full w-full">
      <div
        className="bg-green-300 text-green-800 flex items-center justify-center text-lg"
        style={{ height: "56px" }}
      >
        Loading...
      </div>
      {/* <div
        className="ml-4 flex items-center absolute top-0 left-0"
        style={{ height: `56px` }}
        onClick={() => {
          getFire().auth().signOut();
        }}
      >
        Logout
      </div> */}
      <div
        className=" flex items-center justify-center"
        style={{ height: `calc(100% - 56px)` }}
      >
        {/*  */}
        <div>
          <div>Please wait for Login checker....</div>
        </div>
      </div>
      <div>{/*  */}</div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="bg-white bg-opacity-95 h-full w-full">
      <div
        className="bg-blue-300 text-blue-800 flex items-center justify-center text-lg"
        style={{ height: "56px" }}
      >
        Login Page
      </div>
      {/* <div
        className="ml-4 flex items-center absolute top-0 left-0"
        style={{ height: `56px` }}
        onClick={() => {
          getFire().auth().signOut();
        }}
      >
        Logout
      </div> */}
      <div
        className=" flex items-center justify-center"
        style={{ height: `calc(100% - 56px)` }}
      >
        {/*  */}
        <div
          onClick={() => {
            loginGoogle();
          }}
          className="p-3 bg-blue-500 text-white px-6 rounded-full cursor-pointer"
        >
          Login with Google
        </div>
      </div>
      <div>{/*  */}</div>
    </div>
  );
}
