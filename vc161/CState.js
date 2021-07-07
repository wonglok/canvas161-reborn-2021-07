import { Vector3 } from "three";
import { getFire } from "../vfx-others/ENFire";
import { makeShallowStore } from "../vfx-others/ENUitls";

export const getCStateItems = () => {
  return {
    viewMode: "roomView",

    //
    roomView: {
      target: new Vector3(),
      position: new Vector3(0, 25, 25),
    },

    buildingView: {
      target: new Vector3(),
      position: new Vector3(0, 25, 25),
    },

    //
    topView: {
      target: new Vector3(),
      position: new Vector3(0, 25, 0),
    },

    orbitView: {
      target: new Vector3(),
      position: new Vector3(25, 25, 25),
    },

    //
    overlay: ``,
    currentMapID: false,
    currentSlotID: false,

    taken: [],
    slotData: [],
    mapData: false,
    reload: 0,
    isDown: false,
    movement: 0,

    gameMode: "map",

    refreshBuilding: 0,
    refreshGallery: 0,
    panel: ``,

    esc: [],
  };
};

export const OfficalListings = {};

//

export const CState = makeShallowStore(getCStateItems());

export const obtainSlot = ({ mapID, slotID }) => {
  let user = getFire().auth().currentUser;
  if (user && user.uid) {
    return getFire()
      .database()
      .ref(`/maps/${mapID}/taken/${slotID}`)
      .set(user.uid)
      .then(() => {
        return getFire()
          .database()
          .ref(`/maps/${mapID}/slotData/${slotID}/owner`)
          .set({
            ownerUID: user.uid,
            userDisplayName: user.displayName,
            userPhotoURL: user.photoURL,

            color: "#00ff00",
            useImage: false,
            image: "",

            buildings: {},
          })
          .then(() => {
            CState.reload++;
          });
      });
  } else {
    return Promise.reject(new Error("no user uid"));
  }
};

// console.log(v.data.slotID);
//                 //content
//                 // idx, idy
//                 // let mapID = `first`;
//                 // let slotID = v.data.slotID;

//                 CState.mapID = "first";
//                 CState.currentSlotID = v.data.slotID;
//                 CState.overlay = "slot";

export function uploadFileToUser() {}
