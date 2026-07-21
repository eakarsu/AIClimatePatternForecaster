# Reproducible climate forecast workflow

`/api/governed-forecasts` registers immutable dataset and model versions, snapshots a run, records external-compute completion or failure, validates uncertainty intervals, stores hindcast metrics by region/horizon/subgroup, and requires reviewer publication. Published output is explicitly research decision support, never an official warning or operational-safety determination.

Run `scripts/bootstrap.sh`, configure `.env`, apply `scripts/migrate.sh`, then run `start.sh`. Startup does not install, create/migrate/seed a database, start system services, or kill ports. Generated `gap-*` routes are unmounted.

Authoritative NOAA/ECMWF/reanalysis licensing and credentials, geospatial/object storage, compute workers, regional hindcast datasets, scientific peer review, and production operations remain external deployment/validation work.
