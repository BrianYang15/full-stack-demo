
.PHONY:

build:
	docker compose -f docker-compose.yaml build f --no-cache

sh:
	docker compose -f docker-compose.yaml run --service-ports f bash

exec-b:
	docker compose -f docker-compose.yaml exec f bash

upd:
	docker compose up -d

down:
	docker compose down --remove-orphans

chown:
	sudo chown -R ${USER}:${USER} ./app

prune:
	docker system prune -a
