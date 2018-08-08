import React from 'react'
import ProgressBar from '../../../components/ProgressBar'
import styled from 'styled-components'
import moment from 'moment'
import ActivityWrapper from './ActivityWrapper'

const NameAndPath = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

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

const Activity = ({ activity }) => (
  <ActivityWrapper>
    <td>
      <span className="icon icon-upload" title={activity.type}></span>
    </td>
    <td>
      <NameAndPath>
        <h4>{activity.filename}</h4>
        <span>{activity.path}</span>
      </NameAndPath>
    </td>
    <td>
      <Progress>
        {
          activity.interrupted
            ? 'Interrupted'
            : activity.finished
              ? <span>{activity.size.value} {activity.size.unit}</span>
              : <React.Fragment>
                <span>{activity.progress.value} {activity.progress.unit} of {activity.size.value} {activity.size.unit}</span>
                <ProgressBar percentage={activity.progress.bytes / activity.size.bytes * 100} />
              </React.Fragment>

        }
      </Progress>
    </td>
    <td>
      {moment(activity.timestamp).fromNow()}
    </td>
  </ActivityWrapper>
)

export default Activity
