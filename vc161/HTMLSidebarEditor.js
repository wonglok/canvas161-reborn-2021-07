import { useEffect, useState } from "react";
import { getFire, toArray } from "../vfx-others/ENFire";
import { getID } from "../vfx-others/ENUitls";
import { getPanelHeight } from "./C161";
import { CState } from "./CState";

export function HTMLSidebarEditor() {
  let [buildings, setBuildings] = useState([]);

  let getOwnerRef = () =>
    getFire()
      .database()
      .ref(
        `/maps/${CState.currentMapID}/slotData/${CState.currentSlotID}/owner`
      );
  useEffect(() => {
    return getOwnerRef().on("value", (snap) => {
      //
      if (snap) {
        let val = snap.val();
        if (val) {
          if (!val.buildings) {
            return getOwnerRef().child("buildings").set([]);
          } else {
            setBuildings(toArray(val.buildings));
            return Promise.resolve();
          }
        } else {
          return Promise.resolve();
        }
      }
      return Promise.resolve();
    });
  }, []);

  return (
    <>
      <div
        className="absolute bottom-0 left-0 w-full bg-gray-300"
        style={{ height: `${getPanelHeight()}px` }}
      >
        <div
          className="bg-gray-400 absolute left-0 p-3 inline-flex items-center cursor-pointer"
          style={{
            top: `-47px`,
          }}
          onClick={() => {
            //
            CState.viewMode = "roomView";
            CState.gameMode = "map";
          }}
        >
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
          >
            <path d="M2.117 12l7.527 6.235-.644.765-9-7.521 9-7.479.645.764-7.529 6.236h21.884v1h-21.883z" />
          </svg>
          <div className="ml-3 inline-block">Back</div>
        </div>

        <div className="ml-3 mt-3">
          {/*  */}
          {/*  */}
          <button
            onClick={() => {
              let item = getOwnerRef().child("buildings").push();
              item.set({
                type: "blocker",
                draw: "mesh",
                geometry: "ball",
                material: "default",
              });
            }}
          >
            Add Ball Building
          </button>

          {/*  */}
          <button
            onClick={() => {
              let item = getOwnerRef().child("buildings").push();
              item.set({
                type: "blocker",
                draw: "mesh",
                geometry: "box",
                material: "default",
              });
            }}
          >
            Add Box Building
          </button>
        </div>
      </div>

      {/* <pre className=" absolute top-0 right-0 pointer-events-none">
        {JSON.stringify(buildings, null, "  ")}
      </pre> */}
    </>
  );
}
