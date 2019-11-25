/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { HashRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import axios from 'axios';

const rootEl = document.querySelector('#root');

const ADD_PEOPLE = 'ADD_PEOPLE';
const ADD_COUNT = 'ADD_COUNT';

const initState = {
  people: [],
  count: 0,
};

const reducer = (state = initState, action) => {
  if (action.type === 'ADD_PEOPLE') {
    state.people = action.people;
  }
  if (action.type === 'ADD_COUNT') {
    state.count = action.count;
  }
  return state;
};

const store = createStore(reducer);

const Tableheader = ()=> {
  return(
    <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Title</th>
          </tr>
        </thead>
  )
}

class Table extends Component {
  constructor(props) {
    super();
    this.state = store.getState();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async componentDidUpdate(prev) {
    const prevLocation = prev.match.params.page;
    const currLocation = this.props.match.params.page;
    if (prevLocation !== currLocation) {
      store.dispatch({
        type: ADD_PEOPLE,
        people: (await axios.get(`/api/employees/${currLocation}`)).data.rows,
      });
    }
  }

  async componentDidMount() {
    const page = this.props.location.pathname;
    store.dispatch({
      type: ADD_PEOPLE,
      people: (await axios.get(`/api/employees${page}`)).data.rows,
    });
    store.dispatch({
      type: ADD_COUNT,
      count: (await axios.get(`/api/employees${page}`)).data.count,
    });
    this.unsubscribe = store.subscribe(() => this.setState(store.getState()));
  }

  render() {
    const { people } = this.state;
    return (
      <table>
        <Tableheader />
        <tbody>
          {people.map(person => {
            return (
              <tr>
                <td>{person.firstName}</td>
                <td>{person.lastName}</td>
                <td>{person.email}</td>
                <td>{person.title}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

const Paginator = props => {
  const pageCount = Math.ceil(props.count / 50);

  const links = [];
  for (let i = 0; i < pageCount; i++) {
    links.push(i);
  }

  const currentPage = parseInt(props.location.pathname.slice(1));
  return (
    <nav>
      <Link to={currentPage - 1 >= 0 && `${currentPage - 1}`}>Prev</Link>
      {links.map((link, idx) => {
        return (
          <Link
            to={`/${idx}`}
            className={props.location.pathname === `/${idx}` ? 'selected' : ''}
          >{`${link + 1}`}</Link>
        );
      })}
      <Link to={currentPage + 1 < pageCount && `${currentPage + 1}`}>Next</Link>
    </nav>
  );
};

class App extends Component {
  constructor(props) {
    super();
    this.state = store.getState();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.setState(store.getState()));
  }

  render() {
    return (
      <div>
        <h1>ACME Pager</h1>
        <HashRouter>
          <div className="table-striped thead-dark table myTable">
            <Switch>
              <Route
                exact
                path="/:page"
                render={props => <Table {...props} {...this.state} />}
              />
              <Redirect
                to="/0"
                render={props => <Table {...props} {...this.state} />}
              />
            </Switch>
          </div>
          <Route render={props => <Paginator {...props} {...this.state} />} />
        </HashRouter>
      </div>
    );
  }
}

ReactDOM.render(<App />, rootEl);
