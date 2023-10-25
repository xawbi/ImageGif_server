import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    const userId = request.user?.id ? Number(request.user.id) : null

    context.getArgs()[0].userId = userId

    return userId
  },
)
