import React from 'react'
import styled from 'styled-components'

const CircularProgressRoot = styled.div`
	height: 50px;
	width: 50px;
	animation: spin 1s steps(12, end) infinite;

	i {
		height: 12px;
		width: 4px;
		margin-left: -2px;
		display: block;
		position: absolute;
		left: 50%;
		transform-origin: center 25px;
		background: #000;
		box-shadow: 0 0 3px rgba(255, 255, 255, .7);
		border-radius: 3px;
	}

  & i:nth-child(1) { opacity: .08000; }
  & i:nth-child(2) { opacity: 0.1670; transform:rotate(30deg); }
  & i:nth-child(3) { opacity: 0.2500; transform:rotate(60deg); }
  & i:nth-child(4) { opacity: 0.3300; transform:rotate(90deg); }
  & i:nth-child(5) { opacity: 0.4167; transform:rotate(120deg); }
  & i:nth-child(6) { opacity: 0.5000; transform:rotate(150deg); }
  & i:nth-child(7) { opacity: 0.5830; transform:rotate(180deg); }
  & i:nth-child(8) { opacity: 0.6700; transform:rotate(210deg); }
  & i:nth-child(9) { opacity: 0.7500; transform:rotate(240deg); }
  & i:nth-child(10) { opacity: 0.8330; transform:rotate(270deg); }
  & i:nth-child(11) { opacity: 0.9167; transform:rotate(300deg); }
  & i:nth-child(12) { opacity: 1.0000; transform:rotate(330deg); }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const CircularProgress = () => (
  <CircularProgressRoot>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
  </CircularProgressRoot>
)

export default CircularProgress
