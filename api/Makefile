
.PHONY:

build:
	docker compose -f docker-compose.yaml build api --no-cache

sh:
	docker compose -f docker-compose.yaml run --service-ports api bash

exec-b:
	docker compose -f docker-compose.yaml exec api bash

upd:
	docker compose up -d

down:
	docker compose down --remove-orphans

chown:
	sudo chown -R ${USER}:${USER} .

chown-b:
	sudo chown -R ${USER}:${USER} ./app

prune:
	docker system prune -a
