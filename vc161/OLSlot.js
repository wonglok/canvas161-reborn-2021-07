import router from "next/router";
import { useEffect, useState } from "react";
import { getFire, loginGoogle } from "../vfx-others/ENFire";
import { CState, obtainSlot } from "./CState";
export function OLSlot() {
  let [reload, reloader] = useState(0);
  let hasData = CState.slotData.find((e) => e.key === CState.currentSlotID);

  return (
    <>
      {!hasData && (
        <div className="bg-white bg-opacity-95 h-full w-full">
          <div
            className="bg-purple-500 text-white flex items-center justify-center text-lg"
            style={{ height: "56px" }}
          >
            Slot Not Found
          </div>

          <div className="flex items-center mt-12 justify-center">
            Cant find this slot.
          </div>
        </div>
      )}
      {(hasData && CState.slotData.length > 0 && (
        <div className="bg-white bg-opacity-95 h-full w-full">
          <div
            className="bg-yellow-500 flex items-center justify-center text-lg"
            style={{ height: "56px" }}
          >
            Slot {CState.currentSlotID.split("_").join("-")}
          </div>

          {getFire().auth().currentUser && (
            <div
              className="ml-4 flex items-center absolute top-0 left-0"
              style={{ height: `56px` }}
              onClick={() => {
                getFire()
                  .auth()
                  .signOut()
                  .then(() => {
                    reloader((s) => s + 1);
                  });
              }}
            >
              Logout
            </div>
          )}

          <div>
            <SlotStatus></SlotStatus>
          </div>

          <div>
            <SlotDetailsDisplay></SlotDetailsDisplay>
          </div>
        </div>
      )) || (
        <div className="w-full h-full flex items-center justify-center">
          Welcome to Canvas161!
        </div>
      )}
    </>
  );
}

function SlotDetailsDisplay() {
  CState.makeKeyReactive("taken");
  CState.makeKeyReactive("reload");

  let slotData = CState.slotData.find((e) => e.key === CState.currentSlotID);

  return (
    <div>
      Slot Data Details
      {/*  */}
      <div>
        Share link:{" "}
        <a
          className="text-blue-500 underline"
          target="_blank"
          href={`https://canvas161.com/${CState.currentMapID}/${CState.currentSlotID}`}
        >
          https://canvas161.com/{CState.currentMapID}/{CState.currentSlotID}
        </a>
      </div>
      <pre>{JSON.stringify(slotData, null, "  ")}</pre>
    </div>
  );
}

function SlotStatus() {
  CState.makeKeyReactive("taken");

  let hasData = CState.slotData.find((e) => e.key === CState.currentSlotID);
  let isBought = CState.taken.find((e) => e.key === CState.currentSlotID);

  return (
    <>
      {hasData && (
        <div className="text-lg text-center p-3">
          <div className="mb-3">
            Slot {CState.currentSlotID.split("_").join("-")} is{" "}
            {isBought ? "taken" : "ready to be taken"}
          </div>
          <div>
            {!isBought && (
              <button
                onClick={() => {
                  //

                  if (getFire().auth().currentUser) {
                    obtainSlot({
                      mapID: CState.currentMapID,
                      slotID: CState.currentSlotID,
                    }).then(() => {});
                  } else {
                    loginGoogle().then(() => {
                      obtainSlot({
                        mapID: CState.currentMapID,
                        slotID: CState.currentSlotID,
                      }).then(() => {});
                    });
                  }

                  //
                }}
                className="bg-green-500 px-6 py-3 text-white rounded-full shadow-md drop-shadow-lg "
              >
                Own this Tile
              </button>
            )}
          </div>
        </div>
      )}
      {!hasData && <div>No Such Slot</div>}
    </>
  );
}
