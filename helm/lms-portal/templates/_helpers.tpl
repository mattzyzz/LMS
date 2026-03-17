{{/*
Expand the name of the chart.
*/}}
{{- define "lms.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "lms.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Chart label
*/}}
{{- define "lms.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "lms.labels" -}}
helm.sh/chart: {{ include "lms.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "lms.backend.labels" -}}
{{ include "lms.labels" . }}
app.kubernetes.io/name: {{ include "lms.fullname" . }}-backend
app.kubernetes.io/component: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "lms.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "lms.fullname" . }}-backend
app.kubernetes.io/component: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "lms.frontend.labels" -}}
{{ include "lms.labels" . }}
app.kubernetes.io/name: {{ include "lms.fullname" . }}-frontend
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "lms.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "lms.fullname" . }}-frontend
app.kubernetes.io/component: frontend
{{- end }}

{{/*
PostgreSQL host
*/}}
{{- define "lms.postgresql.host" -}}
{{- if .Values.postgresql.enabled }}
{{- printf "%s-postgresql" .Release.Name }}
{{- else }}
{{- .Values.backend.env.DATABASE_HOST }}
{{- end }}
{{- end }}

{{/*
Redis host
*/}}
{{- define "lms.redis.host" -}}
{{- if .Values.redis.enabled }}
{{- printf "%s-redis-master" .Release.Name }}
{{- else }}
{{- .Values.backend.env.REDIS_HOST }}
{{- end }}
{{- end }}

{{/*
Image with global registry
*/}}
{{- define "lms.image" -}}
{{- if .global.imageRegistry }}
{{- printf "%s/%s:%s" .global.imageRegistry .image.repository .image.tag }}
{{- else }}
{{- printf "%s:%s" .image.repository .image.tag }}
{{- end }}
{{- end }}
