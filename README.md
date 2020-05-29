# Data Studio Community Radar community visualization

Data Studio [community visualizations][community viz] allow you to write custom
JavaScript visualizations for [Google Data Studio][datastudio].

![Radar Chart](./src/radar.png)

This [radar] community visualization built with d3.js takes 2 dimensions and a metric. It works best with dimensions of moderate [cardinality] - for example, dimensions with 5-10 unique values.

> Note: This radar will not render properly if the metric values are not in decimal format, not percent.

## Webpack usage

This package uses [dscc-gen] for local development. Simply follow the instructions on that page and you're good to go.

## Deployed version

Component ID of the deployed version of this visualization:

```
gs://TBD
```

See the visualization [deployed].

## Authors

This code was written by Steven Hoglund.

[community viz]: http://developers.google.com/datastudio/visualization
[datastudio]: https://datastudio.google.com
[cardinality]: https://en.wikipedia.org/wiki/Cardinality
[dscc-gen]: https://developers.google.com/datastudio/visualization/library
[deployed]: TBD
