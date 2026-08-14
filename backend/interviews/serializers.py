from rest_framework import serializers


class GenerateInterviewSerializer(serializers.Serializer):
    interview_type = serializers.CharField(max_length=100)
    difficulty = serializers.CharField(max_length=50)
