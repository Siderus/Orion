// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { dialog, app } = require('electron').remote

import React from "react";
import ReactDom from "react-dom";
import { Window, Content, PaneGroup ,Pane } from "react-photonkit";
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit";

import Header from "./Components/Header.jsx"
import Footer from "./Components/Footer.jsx";

ReactDom.render(
  <Window>
    <Header />
    <Content>
      <PaneGroup>
        <Pane className="padded-more">
        </Pane>
      </PaneGroup>
    </Content>
    <Footer />
  </Window>
  , document.querySelector("#host"));