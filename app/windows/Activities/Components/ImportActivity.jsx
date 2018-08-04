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
  text-align: right;

  span {
    color: rgb(95,95,95);
  }
`

const Activity = ({ activity }) => {
  return (
    <ActivityWrapper>
      <td>
        <span className="icon icon-down" title={activity.type}></span>
      </td>
      <td>
        <NameAndPath>
          <h4>{activity.hash}</h4>
        </NameAndPath>
      </td>
      <td>
        <Progress>
          {
            !activity.finished && <ProgressBar indeterminate />
          }
          {
            activity.finished && (activity.size
              ? <span>{activity.size.value} {activity.size.unit}</span>
              : 'Unknown'
            )
          }
        </Progress>
      </td>
      <td>
        {moment(activity.timestamp).fromNow()}
      </td>
    </ActivityWrapper>
  )
}

export default Activity
