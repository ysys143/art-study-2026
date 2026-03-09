# 4장: 이진 모델에서 연속 모델로 (pp. 65-68)

> **원문**: Stephen Grossberg, *Conscious MIND Resonant BRAIN*, Chapter 2 (pp. 65-68)
>
> 이 문서는 원문의 서사적 흐름을 따라, 수식·그림·이론을 한국어로 친절하게 풀어 설명합니다.

---

## 4.1 역사적 배경: 이진 신경망 모델의 탄생

### McCulloch-Pitts 모델 (1943): 이진 스파이크의 시작

신경망 연구의 세 가지 주요 출처 중 하나인 **이진 모델(Binary models)** 의 역사는 1943년으로 거슬러 올라갑니다 (Figure 2.12 참조). 이 해의 중요한 이정표는 Warren McCulloch와 Walter Pitts가 MIT에서 근무하던 시절 발표한 **"A Logical Calculus of the Ideas Immanent in Nervous Activity"** 라는 논문에 담긴 **McCulloch-Pitts 모델**입니다.

McCulloch-Pitts 모델의 핵심 특징:

- **이산 시간(discrete time)** 에서 작동
- **임계값 논리(threshold logic) 시스템**
- 뉴런의 활동 $x_i$는 **이진 신호(+1, 0, -1)** 를 방출
- `sgn` 함수를 사용: $w > 0$일 때 +1, $w = 0$일 때 0, $w < 0$일 때 -1

이 모델은 신경 활동을 수학적으로 기술하려는 시도로, 복잡한 논리 연산이 여러 요소 간의 +1, 0, -1 신호 조합으로 가능함을 보여주었습니다.

**흥미로운 사실**: 이 모델에 사용된 **-1 신호**는 생물학적으로 설명하기 어려운 부분이었습니다. 실제 뉴런은 주로 긍정적 신호(+)만을 발생시키는데, -1은 순수한 계상적 목적(논리 연산 가능성 확장)을 위해 도입되었습니다.

### Eduardo Caianiello의 기여: 생물학적으로 더 현실적인 이진 모델

McCulloch-Pitts 모델 이후, Eduardo Caianiello(1961)는 나폴리에서 연구하며 **STM(단기기억) 방정식**을 제안했습니다:

- 이 역시 이산 시간에서 작동
- **과거의 다양한 시점에서의 활동**에 의해 영향을 받음
- **생물학적으로 타당한 이진 신호 방출**: 활동이 양수일 때 +1, 그 외에는 0
- McCulloch-Pitts 모델의 **음수 신호 문제** 해결

---

## 4.2 연속 시간으로의 발전: Perceptron과 역전파

### Frank Rosenblatt의 Perceptron (1958)

1958년, Frank Rosenblatt은 McCulloch-Pitts 모델을 발전시켜 **Perceptron 모델**을 제시했습니다:

- **연속 시간(continuous time)** 에서 진화하는 STM 방정식
- 자발적으로 감쇠할 수 있는 활동
- **비제로 임계값(non-zero threshold) 위에서 이진 신호 생성**

Perceptron의 수학적 표현:

$$\frac{d}{dt}x_i = -Ax_i + \text{(활동이 임계값 이상일 때 이진 신호 방출)}$$

이 모델은 **선형 분류기**로, 입력 벡터를 분류하고 다른 카테고리(예: 고양이 vs. 개)로 구분할 수 있었습니다. 단, 이 모델은 **선형적으로 분리 가능한 패턴**에만 적용 가능했습니다.

### 학습의 도입: STM과 LTM의 분리

Caianiello와 Rosenblatt 모델 모두 **학습(learning)** 에 관심을 가졌습니다:

- **적응 가중치(LTM traces)** 를 변경하는 방정식 도입
- 하지만 STM과 LTM의 상호작용은 분리되어 있음:
  1. STM 변화 발생
  2. 알고리즘이 LTM 조정
  3. 주기 반복
- **문제점**: 자율적으로 실시간으로 적응하지 못함
- **LTM 방정식의 디지털적 특성**: LTM은 상수 속도로 증가하거나 하한/상한 한계에 도달

---

## 4.3 역전파(Backpropagation)의 역사와 한계

### 역전파 알고리즘의 독립적 발견

역전파 알고리즘은 여러 연구자에 의해 독립적으로 발견되었습니다:

- **1972년**: Shun-Ichi Amari (일본)
- **1974년**: Paul Werbos (하버드 박사 학위 논문)
- **1982년**: David Parker (캘리포니아)
- **1986년**: Rumelhart, Hinton, Williams - 이 논문이 너무 자주 인용되어 역전파의 진정한 원천이 가려짐

**Paul Werbos**가 현대적 형태의 알고리즘을 처음 발표하고 성공적으로 응용한 것으로 평가받습니다.

### 역전파의 기술적 기원: 최급하강법

역전파는 수학의 오래된 아이디어인 **최급하강법(steepest or gradient descent)** 을 사용합니다:

- **Carl Friedrich Gauss(1814)** 까거나 더 오래된 역사
- 학습 과정에서 적응 가중치를 목표 값으로 끌어당김
- **핵심 문제**: 학습된 가중치(LTM traces)가 알고리즘의 한 지점에서 계산되어 다른 지점으로 이동됨
- **물리적 분리**: 학습과 기억(데이터 필터링)의 기능적 분리가 아닌 물리적 분리

**생물학적 문제점**: 뇌에서와 달리 **비국소적 가중치 이동(non-local transport of weights)** 이 발생

### 역전파와 딥러닝의 한계

역전파는 다음과 같은 심각한 한계를 가집니다:

1. **계산적 한계**:
   - 1988년 Grossberg가 지적한 17가지 주요 한계
   - **Adaptive Resonance Theory(ART)** 에서 이 문제들을 해결

2. **실제 적용의 문제점**:
   - **재앙적 잊어버림(catastrophic forgetting)**
   - **일반화 성능 부족(poor generalization)**
   - **설명 가능한 AI 문제(Explainable AI)**: 모델이 환경을 이해하는지 여부 불명확

3. **Hinton의 자기 비판(2017)**:
   - "역전파에 대해 심각히 의심스럽다"
   - "뇌가 그렇게 작동하는 것 같지 않다"
   - "모든 레이블링된 데이터가 필요한 것은 아니다"
   - "모든 것을 버리고 다시 시작하라"

### 딥러닝의 성공과 한계

**성공 요인**:
- 월드 와이드웹으로부터 거대한 데이터베이스 활용
- 엄청나게 빠른 컴퓨터 네트워크 활용
- **느린 학습(slow learning)**: 각 학습 시행에서 적응 가중치가 거의 변화하지 않음
- 많은 수의 감독 학습 시행

**기본적인 한계**:
- 뇌의 작동 방식과는 본질적으로 다름
- 뇌 데이터를 지원하는 아키텍처가 아님
- 동물 지능과 관련된 일반적인 목적의 유연한 능력 구현 불가능

---

## 4.4 Anderson의 Brain-State-in-a-Box (BSB)

### James Anderson의 패턴 인식 모델

James Anderson(Brown University)은 **선형 시스템 이론**에서 영감을 받아 신경 패턴 인식 모델을 제시했습니다:

- **선형 방정식(linear equation)** 에서 활동이 결정됨
- **연속적이고 이진적 특성을 결합한 출력**:
  - 주어진 중간 범위에서는 출력이 활동과 선형적으로 증가
  - 활동이 매우 작거나 크면 양/음의 상수 값으로 포화(saturate)

### BSB 모델의 이름의 유래

모델의 이름은 출력 함수의 특성을 잘 설명합니다:

> **"Brain-State-in-a-Box"**
>
- 뇌 상태가 상자 안에 담긴 듯한 개념
- 상자 벽(포화)에 도달할 때까지 활동이 변함
- 다양한 패턴 분류 응용에 사용됨

### BSB 모델의 개념적 문제점

1. **노이즈 증대 문제**: 활동이 노이즈를 억제하기보다 증대시킬 수 있음
2. **Grossberg의 해결책**: 1973년 논문 "Contour Enhancement, Short-Term Memory, and Constancies in Reverberating Neural Networks"에서 노이즈 증대 문제의 수학적 해결 제시
3. **핵심 통찰**: **시그널 함수(signal functions)** 의 적절한 선택으로 노이즈 증대 회피 가능 (Figure 1.7 참조)

---

## 4.5 Kohonen의 Self-Organizing Maps (SOM)

### Teuvo Kohonen의 전이: 선형대수에서 생물학적 모델로

Teuvo Kohonen(헬싱키 대학교)은 다음과 같은 전이를 겪었습니다:

- **Moore-Penrose 유사역행렬(Moore-Pseudoinverse)** 같은 선형대수 개념
- **비선형 상호작용을 포함한 생물학적 모델**로의 전환

### SOM의 작동 원리

Self-Organizing Map (SOM) 모델은 다음과 같은 특징을 가집니다:

1. **적응 필터(adaptive filter)** 출력의 경쟁:
   - 가장 큰 총 입력을 받는 셀 또는 소규모 셀 집합이 승자로 선택됨
2. **카테고리 분류**: 승자 카테고리가 들어오는 데이터를 분류하는 데 사용됨

### SOM의 역사적 정정

Grossberg는 자신이 SOM의 더 조기 기여를 했다고 주장합니다:

- **1970년대 초**: 케임브리지와 보스턴에서의 연구
- **Christoph von der Malsburg** (뒤데몰트 슐레)과의 협업
- **1960년대부터**: SOM의 학습 법칙과 경쟁 네트워크 수학적 분석 시작

### SOM의 한계와 개선된 생물학적 모델

Kohonen의 단순화된 SOM에는 여러 한계가 있습니다:

- **매우 단기 기억(Short-Term Memory, STM)** 부재
- **중기 기억(Medium-Term Memory, MTM)** 결여
- **생물학적 SOM의 중요성**:
  - 시야(speech), 감정-인지 상호작용(cognitive-emotional interactions), 공간 항법(spatial navigation) 등 광범위한 뇌 과정에 사용
  - **Adaptive Resonance Theory(ART)** 내에서 작동 시 **안정성-가소성 딜레마(stability-plasticity dilemma)** 해결
  - 재앙적 잊어버림(catastrophic forgetting) 방지

---

## 4.6 생물학적 근거: Hartline-Ratliff과 Hodgkin-Huxley

### Hartline-Ratliff 방정식: 말굽게비 망막 모델

**H. Keffer Hartline**(1967년 노벨상 수상자)과 **Floyd Ratliff**의 연구:

- **말굽게비(Limulus)의 옆눈**에서의 신경생리학적 실험
- **재귀 억제(recurrent inhibition)** 가 망막의 순활성 감소 시킴
- **Hartline-Ratliff-Miller 모델**:
  - 시간에 따른 재귀 억제 동학 모델링
  - **연속 임계값 논리 시스템**
  - Additive Model의 선구자 (Figure 2.9)

### Hodgkin-Huxley 방정식: 오징거 거대 축삭 모델

**Sir Alan Hodgkin**과 **Sir Andrew Huxley**의 획기적 공허 (1952년, 노벨상 1963년 수상):

- **오징거(squid) 거대 축삭(squid giant axon)** 에서의 실험
- 전기 신호(빨간 곡선, Figure 2.14)가 축삭을 따라 감염 없이 전달되는 메커니즘 설명
- **Hodgkin-Huxley 모델**: 신경 충파(propagation)의 수학적 모델링
- **중요성**: 개별 뉴런이 아닌 신경망에 초점을 맞춘 Grossberg의 작업과 대조적

---

## 4.7 뇌에서 마음으로: 분산 패턴의 중요성

### 뇌-마음 연결의 패러다임 전환

1957-58년, Grossberg는 다음과 같은 혁신적인 패러다임 제시:

- **비선형 신경망**을 사용해 뇌 메커니즘을 심리학적 기능과 연결
- **행동 성공을 지배하는 기능적 단위는 단일 스파이크가 아닌**:
  - **네트워크 수준의 분산 패턴**
  - **시스템 수준의 분산 패턴**

### 진화의 압력: 협력과 경쟁

Gedanken Experiment(사고 실험)는 다음과 같은 심오한 통찰을 제공:

- **세포 수준에서 경쟁이 보편적인 이유**
- **무한(infinity)이 생물학에 존재하지 않음**
- **유한한 흥분 가능한 위치**를 가진 세포의 필수적 조건이 **경쟁 메커니즘**을 요구

### 다중 규모 비선형 피드백 네트워크의 필요성

뇌의 주요 특징:

1. **비선성(nonlinearity)**:
   - "전체는 부품의 합"이 아님
   - 뇌에서는 곱셈과 나눗셈이 널리 사용됨

2. **피드백(feedback)**:
   - 상향식(bottom-up)과 하향식(top-down) 상호작용
   - 재귀적(recurrent) 처리
   - 뇌-환경 상호작용

3. **다중 시간적 규모**:
   - **STM**: 밀리초 단위
   - **MTM**: 수십~수백 밀리초
   - **LTM**: 초부터 일생까지

4. **다중 공간적 규모**:
   - 객체 부분과 전체 처리
   - 다양한 길이의 단어 분류
   - 다중 규모는 요약 기호 $\sum$으로 표현

### 비선형 피드백의 예

Shunting STM 방정식(Figure 2.10)에서 볼 수 있는 비선성:

- $f(x)yz$와 $g(x)YZ$ 같은 곱셉 항
- MTM($y$)과 LTM($z$)이 세포 간 STM 신호($f(x)$)를 곱셉적으로 게이팅(gating)
- 이 비선성은 기능적 요구사항을 달성하는 최소한의 비선성 방정식들

---

## 결론: 비선형성의 중요성

1957-58년에 발견된 비선형 신경망의 법칙들은 오늘날의 기초적이고 고전적이지만, 당시에는 심리학과 뇌과학 연구의 중요한 패러다임 전환을 의미했습니다. 이러한 발견들은:

- 실시간으로 자율적으로 적응하는 개인 학습자 분석에서 파생
- 생물학적 데이터와 심리학적 기능을 연결하는 강력한 프레임워크 제공
- 딥러닝으로 대표되는 현대 AI 기술의 한계를 극복하는 새로지 가능성 열음

이것이 바로 **"Conscious MIND Resonant BRAIN"** 이 이야기하려는 핵심 메시지입니다: 비선성, 다중 규모, 피드백 네트워크를 통해 뇌는 마음을 만들어냅니다.