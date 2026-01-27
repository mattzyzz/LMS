.PHONY: dev down logs backend-shell frontend-shell db-shell migrate seed clean

dev:
	docker-compose up --build

down:
	docker-compose down

logs:
	docker-compose logs -f

backend-shell:
	docker-compose exec backend sh

frontend-shell:
	docker-compose exec frontend sh

db-shell:
	docker-compose exec postgres psql -U lms -d lms

migrate:
	docker-compose exec backend npm run migration:run

seed:
	docker-compose exec backend npm run seed

clean:
	docker-compose down -v
