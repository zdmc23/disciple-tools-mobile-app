import {
  put, take, takeLatest, all, race, call, delay
} from 'redux-saga/effects';
import * as actions from '../actions/user.actions';
// import REQUEST from '../actions/request.actions';

export function* login({ domain, username, password }) {
  yield put({ type: actions.USER_LOGIN_START });

  // fetch JWT token
  yield put({
    type: 'REQUEST',
    payload: {
      url: `https://${domain}/wp-json/jwt-auth/v1/token`,
      data: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      },
      action: actions.USER_LOGIN_RESPONSE
    },
  });

  // handle response
  try {
    // TODO: will this block and cause responses to be missed?
    // use channel instead
    const res = yield take(actions.USER_LOGIN_RESPONSE)
    if (res) {
      response = res.payload;
      jsonData = yield response.json();
      if (response.status === 200) {
        yield put({ type: actions.USER_LOGIN_SUCCESS, domain, user: jsonData });
      } else {
        yield put({ type: actions.USER_LOGIN_FAILURE, error: { code: jsonData.code, message: jsonData.message } });
      }
    }
  } catch (error) {
    yield put({ type: actions.USER_LOGIN_FAILURE, error: { code: '400', message: '(400) Unable to process the request. Please try again later.' } });
  }
}

export default function* userSaga() {
  yield all([
    takeLatest(actions.USER_LOGIN, login),
  ]);
}
