# data-tools

This repository provides some kind of ETL to process the data
from the StateOfJS survey (and other similar surveys) in the form
of a CLI.

## Requirements

-   Node.js 10
-   Yarn
-   Docker/docker-compose

## Installation

```sh
git clone <project_git_url>
yarn install
```

## Structure

You'll find 3 main components:

-   **E**xtract: handle data extraction (from TypeForm for now)
-   **T**ransform: handle data transformation
-   **L**oad: persists the data (es or fs)

This project is written in TypeScript, usually, compiled code is
ignored, but in order to be able to use a git ref in other projects
without having to publish it to npm, for now it's not.
Please make sure to work on `.ts` file as the compiled javascript
will be overriden.

## Usage

Please have a look at the CLI help for usage:

```
./cli --help
```

## Workflow

Starts the docker-compose stack:

```bash
./cli setup
```

Create surveys' indices:

```bash
./cli es:indices:create
```

Make sure the indices have been successfully created:

```bash
./cli es:indices:ls
```

Load the data from TypeForm for the survey you're working on:

```bash
./cli process stateofcss 2019
```

Aggregate the survey data:

```bash
./cli aggregate stateofcss 2019
```
