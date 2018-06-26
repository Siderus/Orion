import React from 'react'
import ProgressBar from '../../../components/ProgressBar'
import styled from 'styled-components'

const NameAndPath = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  h4 {
    margin: 0px;
    color: rgb(95,95,95);
  }

  span {
    color: rgb(127,127,127);
  }
`
const Progress = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;

  div {
    margin-top: 20px;
  }

  span {
    color: rgb(95,95,95);
  }
`
const ActivityWrapper = styled.div`
  margin-top: 5px;
  display: flex;
  width: 100%;
  padding: 5px;
  border-radius: 5px;
  background-color: rgb(239,239,239);
  align-items: center;

  .icon {
    transform: scale(2.5);
    padding: 0 25px;
    color: rgb(95,95,95);
  }
`

const Activity = ({ activity }) => {
  const finished = activity.progress.value === activity.size.value

  return (
    <ActivityWrapper>
      <span className="icon icon-upload"></span>
      <NameAndPath>
        <h4>{activity.filename}</h4>
        <span>{activity.path}</span>
      </NameAndPath>
      <Progress>
        {
          !finished && <ProgressBar percentage={activity.progress.value / activity.size.value * 100} />
        }
        {
          finished ? <span>{activity.size.value} {activity.size.unit}</span>
            : <span>{activity.progress.value} {activity.progress.unit} of {activity.size.value} {activity.size.unit}</span>
        }
      </Progress>
    </ActivityWrapper>
  )
}

export default Activity
