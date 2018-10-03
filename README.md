# testcafe-reporter-elixir
[![Build Status](https://travis-ci.org/ZeleniiZmey/testcafe-reporter-elixir.svg)](https://travis-ci.org/ZeleniiZmey/testcafe-reporter-elixir)

This is the **elixir** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/ZeleniiZmey/testcafe-reporter-elixir/master/media/preview.png" alt="preview" />
</p>

## Install

```
npm install testcafe-reporter-elixir
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter elixir
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('elixir') // <-
    .run();
```

## Author
Palina Lushchynskaya 
