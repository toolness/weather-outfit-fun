This is a simple web page that guides learners towards making
a JavaScript-based app that presents the user with an outfit they
can wear based on the weather forecast from [OpenWeatherMap][].
It's intended for potential use in the [hour of code][].

Unlike [teeny-quiz-fun][], this activity has been designed for learners
with no prior exposure to HTML or CSS, and focuses solely on JavaScript.

Affordances have been added that make it easier to debug the
app's code in a live-reload environment like [Thimble][] and
[JS Bin][].

## API

For a very simple example of a minimalistic implementation of the API
endpoints, see `index.html`.

### Data Types

Functions in the API deal with `forecast` objects that have the following
properties:

* `city` is a string that represents the city being forecast, e.g.
  `"New York City"`.
* `date` is a Date object representing the date and time for which the
  forecast is for. It is usually within 3 hours of the current time.
* `humidity` is a number describing the humidity, e.g. `83`.
  **TODO: What units are these measured in?**
* `next` is an optional property that points to another `forecast`
  object, which represents the forecast 3 hours from `date`. If no such
  forecast exists, this value will be undefined.
* `temp` is a number representing the temperature in Fahrenheit.
* `weather` is a string describing the weather conditions. It is
  one of `"clear"`, `"partly cloudy"`, `"mostly cloudy"`,
  `"raining"`, `"thunderstorming"`, `"snowing"`, and `"misty"`.

### Functions

Learners are expected to implement two global JavaScript functions that
comprise the core "business logic" of the app:

**getForecastWords**(*forecast*)

This function returns a string describing the forecasted weather
conditions, e.g. `"37F and cloudy"`.

**getForecastOutfit**(*forecast*)

This function returns a URL string that points to an image of a
suggested outfit to wear based on the given forecast, e.g. 
`"http://example.org/summer-outfit.jpg"`.

## Limitations

The current implementation is only localized to English and Fahrenheit,
and there's no easy way to use Celsius or another language.

It's not easy to change the HTML, templates, or CSS for the app. Exposing
more of this will be easy in JS Bin, which allows for multiple
hide-able panes of HTML/JS/CSS, but it will be difficult for Thimble, which
only has a single pane with no collapsable parts. This means that not
overwhelming the user with unfamiliar/irrelevant details will be hard.

`getForecastOutfit` can currently only return a URL to an image, but it
should be possible to dynamically construct an outfit using a Canvas object.
This may also require an asynchronous callback.

## Development

To start the development server:

```
git clone https://github.com/toolness/weather-outfit-fun.git
cd weather-outfit-fun
npm install
node bin/server.js
```

Then visit http://localhost:3000.

This development server will regenerate `weather-outfit.js` and its
source map each time they're requested, by examining `src/config.json`
and using it to concatenate the source files it specifies.

## Deployment

To deploy to an HTML page that only includes absolute links to
its sub-resources, run `node bin/export.js` from the command line
and pipe its output somewhere.

For example, on OS X, running `node bin/export.js | pbcopy` will put
the resulting HTML in your clipboard, at which point you can
paste it into Thimble or JS Bin.

If you want to use a different base URL for the sub-resources than
the default of `http://toolness.github.io/weather-outfit-fun/`, you
can supply it as an argument to the export script, e.g.
`node bin/export.js http://example.org/weather-outfit/`.

  [OpenWeatherMap]: http://openweathermap.org/
  [hour of code]: http://csedweek.org/
  [teeny-quiz-fun]: https://github.com/toolness/teeny-quiz-fun
  [Thimble]: https://thimble.webmaker.org/
  [JS Bin]: http://jsbin.com/
