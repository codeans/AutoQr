# AutoQR Production Deployment Guide

The active deployment playbook for the Hetzner VPS lives here:

- [`README_DEPLOYMENT.md`](../../README_DEPLOYMENT.md)

That guide covers:

- GitHub Actions deployment on `push` to `main`
- Docker Compose with internal MongoDB persistence
- Host Nginx proxying for `autoqr.de`, `www.autoqr.de`, and `api.autoqr.de`
- SSL with Let's Encrypt
- Health checks, logs, and rollback steps
