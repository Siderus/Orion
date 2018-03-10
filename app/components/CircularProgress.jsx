import styled from 'styled-components'

const CircularProgress = styled.div`
  border: 3px solid #c0c0c0;
  border-top: 3px solid #6eb4f7;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
export default CircularProgress
