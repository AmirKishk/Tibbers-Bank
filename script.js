'use strict';

// Data
const account1 = {
  owner: 'Amir Kishk',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-02-08T23:36:17.929Z',
    '2023-02-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'de-DE',
};

const account2 = {
  owner: 'Nedzma Kishk',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelName = document.querySelector('.bankName');
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const containerWelcome = document.querySelector('.welcome');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//----------------

// movements dates
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPasssed = calcDaysPassed(new Date(), date);

  if (daysPasssed === 0) return 'Today';
  if (daysPasssed === 1) return 'Yesterday';
  if (daysPasssed <= 7) return `${daysPasssed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// display all the movements
const displayMovments = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1}  
           ${type}</div>
           <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//----------------
// display the balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//----------------
// Diplay all sumamry (could have made them all in one function but this is more readable)

// SummaryIN
const calcSummaryIn = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);
};

// Summaryout
const calcSummaryout = function (acc) {
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);
};

// SummaryIntrest
const calcInterest = function (acc) {
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1) // to exclude any interest below 1€
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//----------------
// add the username key
const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

//----------------
// Update UI
const updateUI = function (acc) {
  // Display movements
  displayMovments(acc);

  // Diplay balace
  calcDisplayBalance(acc);

  // Display summary
  calcSummaryIn(acc);
  calcSummaryout(acc);
  calcInterest(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // in each call, print the remaning time to the UI
    labelTimer.textContent = `${min}:${sec}`;

    //when time is at zero seconds, stop timer and logout user
    if (time === 0) {
      clearInterval(timer);

      labelWelcome.textContent = 'login to get started';

      containerApp.style.opacity = 0;
    }
    // Decrese 1 second
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//----------------
// Event handlers of the logging in
let currectAccount, timer;

// Fake always logged in
// updateUI(account1);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currectAccount = accounts.find(
    acc => inputLoginUsername.value === acc.username
  );

  if (currectAccount?.pin === +inputLoginPin.value) {
    // Display UI and welcome message
    containerApp.style.opacity = 100;

    labelWelcome.textContent = `Welcome back ${
      currectAccount.owner.split(' ')[0]
    }`;

    labelWelcome.style.color = 'yellowgreen';
    labelWelcome.style.fontSize = '2.9rem';

    // Date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      weekday: 'short',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currectAccount.locale,
      options
    ).format(now);

    // clear input fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';

    // TODO: I need to understand the format of this condition
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    updateUI(currectAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  const amount = +inputTransferAmount.value;

  inputTransferTo.value = inputTransferAmount.value = '';

  // TODO: need to revise the ? in the condition
  if (
    amount > 0 &&
    currectAccount.balance >= amount &&
    receiverAcc?.username !== currectAccount.username
  ) {
    // Doing the transfer
    currectAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currectAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currectAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currectAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add Movement
      currectAccount.movements.push(amount);

      // Add loan date
      currectAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currectAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currectAccount.username &&
    +inputClosePin.value === currectAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currectAccount.username
    );

    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
    containerWelcome.style.opacity = 0;
  }
});

//----------------
// BTN SORT
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovments(currectAccount, !sorted);
  sorted = !sorted;
});
