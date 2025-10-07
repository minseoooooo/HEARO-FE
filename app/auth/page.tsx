"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

// 로그인 폼 유효성 검사 스키마
const loginSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
})

// 회원가입 폼 유효성 검사 스키마
const signUpSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z.string().min(8, { message: "비밀번호는 8자 이상이어야 합니다." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"], // 오류 메시지를 confirmPassword 필드에 표시
})

// ID 중복 확인을 위한 상태 타입
type IdCheckState = {
  message: string
  isAvailable: boolean
} | null

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [idCheck, setIdCheck] = useState<IdCheckState>(null)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // ID 중복 확인 API 호출 함수 (Debounce 적용)
  const checkIdAvailability = async (email: string) => {
    if (!z.string().email().safeParse(email).success) {
      setIdCheck(null)
      return
    }

    try {
      // 실제 API 엔드포인트로 수정해야 합니다.
      const response = await fetch(`https://api.herehear.p-e.kr/auth/check-id?email=${email}`)
      const data = await response.json()

      if (response.ok) {
        setIdCheck({ message: "사용 가능한 ID입니다.", isAvailable: true })
      } else {
        // API가 409 (Conflict) 등으로 중복을 알린다고 가정
        setIdCheck({ message: "중복된 ID입니다.", isAvailable: false })
      }
    } catch (error) {
      console.error("ID 중복 확인 오류:", error)
      setIdCheck({ message: "확인 중 오류가 발생했습니다.", isAvailable: false })
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("email", e.target.value)
    form.trigger("email") // 이메일 필드 유효성 검사 트리거

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    if (!isLogin) {
        const newTimeout = setTimeout(() => {
            checkIdAvailability(e.target.value)
        }, 500) // 500ms 디바운스
        setTypingTimeout(newTimeout)
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    form.reset()
    setIdCheck(null)
  }
  
  const onSubmit = (data: z.infer<typeof loginSchema | typeof signUpSchema>) => {
    console.log(data)
    if (isLogin) {
      alert("로그인 요청을 보냅니다.")
      // TODO: 로그인 API 호출
    } else {
      alert("회원가입 요청을 보냅니다.")
      // TODO: 회원가입 API 호출
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image src="/logo.svg" alt="Here&Hear Logo" width={60} height={60} className="mx-auto" />
          <h1 className="text-2xl font-bold pt-4">Here&Hear</h1>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="이메일을 입력하세요" {...field} onChange={handleEmailChange} />
                    </FormControl>
                    {!isLogin && idCheck && (
                      <p className={`text-sm ${idCheck.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {idCheck.message}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="비밀번호를 입력하세요" {...field} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 확인</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showConfirmPassword ? "text" : "password"} placeholder="비밀번호를 다시 입력하세요" {...field} />
                           <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full bg-[#FF6C97] hover:bg-[#ff588a]">
                {isLogin ? "로그인" : "회원가입"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <button onClick={toggleForm} className="text-sm text-gray-600 hover:underline">
            {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
          {/* <a href="#" className="text-sm text-gray-600 hover:underline">비밀번호를 잊으셨나요?</a> */}
        </CardFooter>
      </Card>
    </div>
  )
}