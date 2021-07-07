// import { C161 } from "../../vc161/C161";

import router from "next/router";
import { useEffect } from "react";

export default function HomeLandingPage() {
  useEffect(() => {
    router.push("/");
  }, []);

  return <div></div>;
}
