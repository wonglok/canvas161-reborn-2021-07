import { useState } from "react";
import { AdminChecker, LoginChecker } from "../vc161/LoginChecker";
import { getFire } from "../vfx-others/ENFire";

export default function CMS() {
  return (
    <LoginChecker>
      <AdminChecker>
        <div>
          <div>CMS</div>
          <div>Create Map Data</div>
          <div>
            {/*  */}
            {/*  */}
            {/*  */}
          </div>
          <AddMap></AddMap>
        </div>
      </AdminChecker>
    </LoginChecker>
  );
}

function AddMap() {
  let [size, setSize] = useState("10x10");
  // let [title, setTitle] = useState("MyMap");
  let [mode, setMode] = useState("");
  let [slug, setSlug] = useState("C161LandingMap");
  return (
    <div>
      <input
        type="text"
        className="border-b"
        value={slug}
        onInput={({ target: { value } }) => {
          //
          setSlug(value);
        }}
      ></input>
      <select
        value={size}
        onInput={({ target: { value } }) => {
          setSize(value);
        }}
      >
        <option value={"10x10"}>10x10</option>
        <option value={"15x15"}>15x15</option>
        <option value={"30x30"}>30x30</option>
      </select>
      <button
        onClick={() => {
          setMode("Loading...");

          getFire()
            .database()
            .ref(`/maps/${slug}/writeTest`)
            .set(Math.random())
            .then(() => {
              let xy = size.split("x");

              let countX = xy[0];
              let countY = xy[1];

              // let ref = getFire().database().ref(`/maps`);

              let newMapData = getFire()
                .database()
                .ref(`/maps/${slug}/mapData`);

              newMapData
                .set({
                  title: slug,
                  size: size,
                  width: countX,
                  height: countY,
                })
                .then(() => {
                  let tile = getFire()
                    .database()
                    .ref(`/maps/${slug}/slotData/`);
                  let jsonTree = {};
                  for (let y = 0; y < countY; y++) {
                    for (let x = 0; x < countX; x++) {
                      jsonTree[`${x}_${y}`] = {
                        _id: `${x}_${y}`,
                        x,
                        y,
                        width: countX,
                        height: countY,
                      };
                    }
                  }
                  tile.set(jsonTree).then(() => {
                    return getFire()
                      .database()
                      .ref(`/overWriteProtected/${slug}`)
                      .set(true)
                      .then(() => {
                        setMode("Done!");
                      });
                  });
                });
            });
          // writeTest
        }}
      >
        Create {mode ? `(${mode})` : ""}
      </button>
    </div>
  );
}
