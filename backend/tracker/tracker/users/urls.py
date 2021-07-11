from rest_framework.routers import SimpleRouter
from tracker.users.views import UserViewSet

app_name = "users"

router = SimpleRouter()
router.register("users", UserViewSet)

urlpatterns = router.urls
