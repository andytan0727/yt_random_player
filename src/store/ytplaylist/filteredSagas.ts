import { all, put, select, take } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import * as ActionTypes from "utils/constants/actionConstants";

import { removeFilteredSnippetsByItemIds } from "./filteredActions";
import { selectFilteredSnippets } from "./filteredSelectors";
import {
  deleteListToPlayItemByIdAction,
  deleteListToPlayItemsAction,
} from "./listToPlayActions";

/**
 * Saga which determines whether or not remove filteredSnippets items
 * when there is a deletion on listToPlay
 *
 */
export function* removeFilteredSnippetsOnItemsDeletion() {
  while (true) {
    const action: ActionType<
      typeof deleteListToPlayItemsAction | typeof deleteListToPlayItemByIdAction
    > = yield take([
      ActionTypes.DELETE_LIST_TO_PLAY_ITEMS,
      ActionTypes.DELETE_LIST_TO_PLAY_ITEM_BY_ID,
    ]);
    const filteredSnippets = yield select(selectFilteredSnippets);
    let itemIds: string[] | undefined = undefined;

    switch (action.type) {
      case "DELETE_LIST_TO_PLAY_ITEMS": {
        const { ids } = action.payload;
        itemIds = [...ids];

        break;
      }

      case "DELETE_LIST_TO_PLAY_ITEM_BY_ID": {
        const { id: itemId } = action.payload;
        itemIds = [itemId];

        break;
      }

      default: {
        break;
      }
    }

    // remove itemIds from filteredSnippets
    // if both filtered snippets and itemIds exists
    if (filteredSnippets && itemIds && itemIds.length !== 0) {
      yield put(removeFilteredSnippetsByItemIds(itemIds));
    }
  }
}

export default function* filteredSagas() {
  yield all([removeFilteredSnippetsOnItemsDeletion()]);
}
