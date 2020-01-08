/* @flow */

import type {TabActions, TabsState} from "./types"
import type {TabState} from "../tab/types"
import {last} from "../../lib/Array"
import tabReducer from "../tab/reducer"

let firstTab = tabReducer(undefined, {type: "INIT"})
let init = {
  active: firstTab.id,
  data: [firstTab]
}

export default function reducer(state: TabsState = init, action: TabActions) {
  if (tabAction(action)) return updateTab(state, action)

  switch (action.type) {
    case "TABS_ACTIVATE":
      return {
        ...state,
        active: action.id
      }
    case "TABS_REMOVE":
      if (state.data.length === 1) return state
      return removeTab(state, action.id)
    case "TABS_ADD":
      return {
        active: state.active,
        data: addTabData(state.data, action)
      }
    default:
      return state
  }
}

function addTabData(stateData, {id, data}) {
  let initialState = tabReducer(undefined, {type: "INIT"})
  let search = {...initialState.search, ...data}
  let tab = {...initialState, ...{search}, id}
  return [...stateData, tab]
}

function removeTab(state: TabsState, id) {
  let data: TabState[] = state.data.filter((t) => t.id !== id)

  if (id === state.active) {
    let index = indexOf(state.data, id)
    let lastTab = index + 1 === state.data.length
    let active = lastTab ? last(data).id : data[index].id

    return {data, active}
  } else {
    return {data, active: state.active}
  }
}

function tabAction({type}) {
  return (
    type.startsWith("SEARCH_") ||
    type.startsWith("VIEWER_") ||
    type.startsWith("CHART_") ||
    type.startsWith("COLUMNS_") ||
    type.startsWith("HISTORY_")
  )
}

function updateTab(state, action: Object) {
  let {data, active} = state
  let id = action.tabId || active
  let index = indexOf(data, id)
  let tab = data[index]
  let newData = [...data]
  newData[index] = tabReducer(tab, action)
  return {
    active,
    data: newData
  }
}

function indexOf(data, id) {
  return data.findIndex((t) => t.id === id)
}