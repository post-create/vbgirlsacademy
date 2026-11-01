import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip as ChartTooltip,
} from "recharts";
import {
  Users,
  Settings,
  ChevronLeft,
  Plus,
  X,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Shield,
  GitCompare,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  CalendarRange,
  Layers,
  ClipboardList,
  ChevronRight,
  Link2,
  Copy,
  Check,
  Lock,
  Printer,
  Mail,
  UserCog,
  ArrowUpDown,
  MessageSquarePlus,
  History,
  SlidersHorizontal,
  BarChart3,
  Swords,
  LayoutGrid,
  Hash,
  TrendingUp,
  Menu,
  ChevronDown,
  List,
  ListOrdered,
  LogOut,
  Sparkles,
  Upload,
  AlertTriangle,
} from "lucide-react";
import * as api from "./api.js";
import { POSITION_CATALOG, formatPlayerPositions } from "./positions.js";
import { LineupPitch, FormationsSettingsView, findFormation } from "./lineup.jsx";
import { VersionHistoryView } from "./VersionHistory.jsx";

const LOGO_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAYAAAA+s9J6AAAfXklEQVR42u2da3hTVbrH/zK0GyvxShkK0xqwXqBkuA1gQW5C4SCtUCtFiiMFuZ3xUusoH7g4j1aHeZzDGSs6IpWCjCC3WjpUqCmQ0mrDtVRCULCSKkKhUdEGmQaO5HwIWXutNi3ZO5emyft7njzs7k12dlb2f693rfVebsjOznacP38eBEEEFrvdjpEjR6JjYWEhamtrqUUIoo3ooNFoqBUIoo2QJAkdqBkIoo17QmoCgmhbOrrbaTAYcOutt1LrEISPiIiIgNlsxrRp0zwTYUJCAqKjo6nlCILMUYIIHa5cuUIiJAjqCQmCIBESBImQIAgSIUGQCAkiDImIiHC73+06YU1NDerr69vkQuPi4iD4szb8DJg+p1+QUEdsHBCnZX9ardY2ubejoqJQU1Pj/qBOp3MAEF4ajabZvkC98vPzHQL7Kh0OgF70UvfKXS7cTjk5OW12b7t7ZWRkONz2hDabrc0eXJcvX3Z/gII9CKXYAERGCrv+85//0JiQINqSG2+8MfhE2Ja9njvsdjvdKYTfCLae0G63o2NSUhLOnTvX7GBkZCQOHDiA06dPC/sXLVqE+Ph4v5miDzzwAN0phN9ITk5GXFwcIpuYqb7i888/R25urrBPq9Vi0KBBboda/fv3xw2NjY0OdyeTJAnz5s1DXl6esL+yshKJiYmBa7X9RuD+YTQmJNSNCd9ZASx4OmAfWVpaivHjxwv7cnJysGTJErdWniRJ6ChJEpmLBOEjLl261OKxlrRGEzME0caQCAmCREgQJEKCINqTCJVO5HiNFEm/EqGeyMDeP1FRUYrf01HpG1atWoXi4uKAfCG71AlDL1gxlZYnCJUYCj7Cx9+dh2RvDMjnqclmr1iEa9euDWgjPhnXHVPpXiLUoAHMuz/B8h2f0JjQGzrddBPdTASNCQmCaCMRtpQnMZA0/vIL/UpEu+Z6TuM3OBwOR0sHjUbjdaOQo6KisHbtWmzYsEHYn52djVGjRnnl5nZF6oS7v/kaQ7KeJ99RQjk24Pj8J3Fk4sOI8GJiRpIkfPzxx838qLOysjBp0qRWXdUAID4+HgkJCS0eb3VixlNH7f379zfbN2rUKEyePNn7hqw+TDcToZo+Q4agz+SHvT7PuXPnmomwX79+SEpKCt4xoc8cve2X6U4i1HP5st/u58s+OjdNzBBEG0MiJAgSIUGQCAmCCEUR+szRmxy4CW/wkQO3PwMXOvrrxG+//Tb27t2Lq1evqj7Hxd/8BhOuXiEHbkI1hoKPsN58Ap1//VV9T9WhAw4dOtT+RFhaWorS0lLvT0QO3IRarjlwryYHbu8gB26CxoQEQQS/CP2Z1ZgcuIlQp1UHbk8xm804e/Zss/1Nk6ACwKZNm3Dbbbd5fO5bvjhGDtyEOq45cNc/9rjHEUEXLlzAtGnThH06nQ7Lly9v9n/j4+PRs2dPry/TJxMzCQkJbr3ENRpNswpPgwcPVnbh0bfTzUSops+QIegzerTH/99isTTb161bN584arfJmNAnxWbIgZvwBh84WTc2+jc/TceQbPhAFprShPj3a2vCYBjSMSQFmPMS0CXa/5/11puA+avA3ig2AAl3A08/G/p3Z81JYPmKkBdiaPaE/QcAyVP8/znfW4GlrwT++81bENBKQ21G9WGnCEOc0Fwn3PJhYD4ncXjbfL8pj4SHKRomy1Oh1xNqAKzbDPuqdczptqysDCdOnPBJYcjbb79dTtvRJyHwpuh/zwXitACc0d5Nc/u0d373u9/5dSaSRBhApEP7geEjAQAHDx7EwoULfXbuhoYGaDQaIKYHkJoOrNscODGmPco2jUYjZs+eHVK/W0ZGRtiJMHTd1gy72eZDDz3k01MfO3aMM0lHBK4X1AAYKztAvP/++yH3s0VGhl/oWsj2hKj8DHa7HZIkIT4+HlqtltUJSElJQbdu3RSdbt++fTCZTACA4uJiORPd/QEsHf7Gu2zTYrEIJQkyMjJwUzt1dv/yyy9RUVGBcCU0RagBsHM3pPN1QJwWkiQhNTUV//jHPwAA48aNw7PPKpvi52uRHzx4kAkc/Qc5P8/VU/mTcXIvuHXrVradkpKC9evXt9ufa82aNWEtwtCOovhU/mFHjRrFtjdu3Kj4VP379xcEKfjKznvG/6bok0+wCRmbzYbCwkJ2+PHHH2/XP5OvUgeSCINchMOGDRMmNNz5CLZGdHQ00tLS2N9Hjx6VD05M9v93mfWkYBobjUZnp6/RYOLEiSBIhMFJeRlQd4aJiJ91O3jwoFe94ccffywf8OdShQ1A4kCg3wC269135bHhwoULnTO1BIkwKMeF5q+Ab79lu/iebOfOnYpPOXbsWKE3slqtzj9iegAPjPWfT+cTs4DOTqFZLBYUFBSwQ6mpqXQXkwiDnP1Gtvn73/+eba9du1Zxqv6+ffsiJiYGAGAymVBTUyMffHiK/x4mD8nmLj8hk5SU1GqhEYJEGByU7BBEpNPp2N9VVVXK9KDRID093b1JO2CQf0zRdHlCxmV+unjqqafoDiYRtgOT9NPdTm/8ayK6//772eHdu3crPiU/wcP3Sujdxzl287VJyk3IFBUVsW2dTocHH3yQ7mASYTvABuDL4+zPqVPlBIrl5eWKTdIxY8aw7YqKCnmW9eZbgGHDfXvdCXcLEzKbN29m2+np6TQhEyJ0DItvuWMHC22Kj49naTdc631K0m1ER0cjMTGRLREcPXpUfv/oB30bevP0s8KEDO+srXZCxmKx4NKlS4iKivJ5M1+6dAldu3ZFdHQ0KYtE2IQP8oB/rgIAdO/eHaNHj8b27dvZuE5psp7U1FQmQoPBIEdVDBrs26WKyaluTd+0tDRVEzJmsxl9+/b1a1PPnTsXq1atImWROdpkXGgDq/grSRKGDBnCDu/atUvxKQcPHsy2c3Nz5QMxPYBxyd6PC20Ankh3ng9OD5l//etf7PAf//hHVacNRNiTP3pY6glDhX1Gp58ngOTkZCxdutS5+9p6nxITatCgQdDpdMyhu7q6Wl7IHzIUKCz2/nrnyTOfvPO4VqtVNSFjtVoFIaekpPgsYuHw4cPMOb5Xr16kKhJhC+g/YSkh7rrrLhZVYTKZcObMGUUidM2yuoRRXl4ui3DMWABLvesFx40SJmSaRkuomZAxGAw4ffo0ACA2NhZbtmzxWaWh559/njnHE2SOtmySFhYzFzaNRiOP466JSCmTJk1y//6EvrIJrJbpGWxCxmw2C2bknDlzVJ3yrbfeYtuLFy/2aamvixcvkpJIhJ7aTfLier9+/bwaF/LeNwUFBbILW2cN8Phc7x4YXMgSv5aZlJSkKuNzdXW1ECrUNDO63W5X/OI5d+4c21Yap0mEmwjL9rDN5GTZFaysrExxVEX37t0Fh/DKykr54INj1Zuij4s5ZJYsWcIOq/WQ2bJlC9vOzMyUhXzRBvS9B1KnTopfrokuAPjhhx/Ytj+LaZIIQ4HKz5w3HpzrfS4XNpvNJoYmeYAkSRg5cqQw5mIMf0D9Nc6QYwNLSkpYFvPY2FhVEzI2mw1//etf2d8zZ86UD+43ynlTPX0BQHwP4PY72IOCj63s2rUrqYpE2IqZZ6wCztWxXfxUvyAiD+GjKg4cOCCn/Y/p4fR2UTIudBOyxM9mzps3T9WEDL++mJiYiEGDOB/XdavVtWX0b5kIGxoahJ6QzFES4fXZpWebDzwg91j5+fmKTxUfH8+iKoxGI77lwqYwb4Hya/NDyBIfgf/YY4/JQq45qT5LXLfu7DpramqEmiPdu3cnVZEIr4NRnqDo27cvYmNjmdlWXV2trEOIjhbGlgcOHJAPDvqD8mvLkHtmPmdMRkaGKg+Z6upq5hkEONcGGTu8WMscOJBt1tfXs22dTkdjQhKhh+PCb2udFqpGI5iU+/fvV3w63rzjex3o+nlukrqS+t58C3sgrF69WphMUcO6devY9ty5c8WZ1SV/Vt+GXOZx/sEzbtw4UhSJ0INxYc0Z4KuTbBefn0VIWeEh/HT/oUOHxKgKJekQuQmZPXv2MA8UnU4nhF95itVqFR4KGRkZ8sHibeqzw2ngTOdxDb6n5ZNpeYrFYsHf/vY3EmHYsVM2xXgzb/v27fJ6n4f07NmTmbR1dXVitP1/eZB0+NqEjP0PQ9kuX4QsGQwGJmStVivnSQXU1+pwBRlf82m1Wq3MawgA7rzzTsUCnDFjBrtOwDkBxegYQSIMaZOUm1xpcb3PQ/gbp6ysTD7Qf4BnJ5gzn42lmnrIzJgxQ9VXfO+999h2dna2PFb7tta7tP3T5ev56KOPZAs1MRG9e/f2XM82G2bOnMmiUQBAr9eLDwuziUQYsiapsUqIquDX+/bu3av4lPws65o1a+QD3WKAia0kgHKZhJyHTFMTUq2HTGlpqayb6dPlgxs+UN8LpiazNPx2u10Ycz700EMeT8rY7XakpaUJXjx6vV6sQbF1E/Dk/LAoEhqePSEAHJej7ZtmUVNa5nvQoEFsqaKurg5ms9l5oLPm+tH2854RkvrysXh8PhslNPWQYc7pDT8D/y5UJ8D77gTeXsl2lZSUCFaDkiWUBQsWCA+J/Px8UYCflQNTHwsLAQIAHH4EQLPXqVOnlJ1kX6XDATgcGh++AIdj4lj2EfX19Y7Y2Fj11+hwONLS0tj78/Pz5QOf7m35+gHn8Wts27aNnUOj0TgaGxsVX0dDQ4PQ3gaDQT646xNlbQmurb46IXzGsGHD2GdkZmZ6fH1ZWVnC9eXm5or/4dO98mf74nd+Z4Wi9jt16lSze3bEiBH+lIkjPHvCa7UqeBc2vjfU6/WKT8lHVQgO4b3uch9V4SZkiV+WWLp0qao1Nz6famJiojjGenuF/NmevCaOBbYXApsLgfh72Gn+8pe/CL1gVlaWR9f26quvCkHQOTk5Yk2Q6sNAZkZg6noEER0Rzuw3sjHOgAEDWNxeeXk55s+fr+hUAwbIYtqwYQPeeOMNpxkY08M5o7h6XfM3pT0qeMjw0/1qy7nxEzIzZ86UhdzwM5CcAoyf4P6NN98CREYCnSSnW1pCX3ZtTYXExw4uWrRIyEzemgBdgdQu4fLO6ag5CYz8Q9gJMHzNUZepkvOSWzMkNjZW8XU2NjY6RowYwc6h1+vlg6vfbf4dAIfj7HfsvyxatIi9NyMjQ1V7HzlyRDBn1ZjVrZlpmZmZzcw0T0zmlStXCu/LzMwU33f2O4cjvod/hh1kjgY5O4qZSdq9e3cWVXH69Glxvc8DJEnCiBEj3C9VjBzd3BT98zNCDhl+WUKthwwfgT9nzhxVM6s8VqsV1dXVWLx4MXr16iWcf8SIESgoKLiuybx582YsWCD70aakpGDNmjXy++rOAGkPO50owjSDY/iao3xURbwGkiQhPT2dLT6XlZUpLtuclJTEwoaEGobx9zjDf/gbbaq8bOArDxl+3e7q1avicomHnDlzBj/++CPOnz8Pk8kkLMa7mDt3Ll577bXrpgQpLS3FtGnThPbhx724aAOeWuD8HcI5hWrYmqMuc2X1u+yj9Ho9u06dTqf4+9bX1zs0Go3775rzkjzbmDhQeF9GRgZ7T05Ojqq23rRpk9v29uVLq9U6tm3b5tH1GAwG4b06nc5RX18vmO+OJ9L999uSOdqO4Lxn+EV7k8kkr/d5SHR0tBCpIJiknNMznn6ObfrCQ8Zutws5ZHyJTqdDdnY2DAYDLBaLkJunJcxms5CpXKfTYffu3ULPKWU/453nDpmjIcRne53jkpgekCQJKSkpbJbSbDYrDiEaOnQoE1V5eTlmzZrlPOCqYfjbHsAYOUKe95BJS0tTNY6rqqoSvE/mzlWe48YlkFtvvRVdunTBfffdh27duqFLly6KfFebJhiOiYlBUVGRaLq+8CzwTh4JkER4bVz45TfAqa/ZJElqaioT4ebNmxV7rfDrjWVlZXJOU1di4F49BQdofoykNqkv7yGTlJTUphmwhTEfnH6rwoOl5qRvSwWEAGSOAoBBzmjGr/cVFBQoLhgTHx8PrVYLAKitrRVnWcdPEEprV1ZWsgmZpmkYPcVmswnrdm1dLu3ll18WHAQWLlwoVJNC/D3A6nfpniMRNoFz2u7du7dwEynNSSpJkhC7J5Rfe3wmMFQ+9/Lly9n2q6++qurS+RwyMTExbV4uTaPRoKioSCghN2XKFHF8PHse8M4K/1U2JhG2Q5N0/15Ww1CSJGFSQU20PV/rYscOuUgpOmuEpL78OE5IPaFgQiYvL4/9/ac//SkoyqVFR0fjgw8+YBYB4CwpJ6QPWfA0kPMSCZFE6LLpAFQfYX+OHj2abev1esUmKd8LGI1GtzlN+RlRtSFLVVVVQjwen++mrenZsyf27NnDoktc421hxnnJyyREEiHH9o+EcZ2rR6moqBDyanraE/DeM01zmtpsNqxYIU9OqPWQ4Sdk0tLSPPLhDLQQeUugtrYWycnJYvaCJS8DTz4R1kIkEbpM0sLNws3D544RxjMewq/38ekqAGekgytm0RsPGd5ZW+3Mqr/p37+/EHFRW1uLyZMnizGb773vLAVnIxGSSfqZPAnDL9yrKRjD16rYsGGDYNJ+8IEc3T5nzhxV47ji4mJByMFcvz4xMRHbtm0TTPQJEyaIQnz7vdazEIQwtFjPc/gQMNwpvhbX+zxk4MCBQlntqqoqJCYmwmw2t5wLVMGEzIcffij0LsOHD/f662u1WkRGRuLee+9Fv379EBsbi/j4eJ+Uv548eTK2bduGKVOmMCHOmjULa9ascT6EOmuAjQVA2mRg197wWsgPa9/Rpn6GnE9nQ0ODQ6fTseuurKxU/P35KPLXX3+9WciSkoh0nsrKSr/7iYLz+czKynIcOXLEJ/eEu7AmgW8sDkfC3RRZH7bjQmOVUMOQT2YrrPd5CL/UUVFRAavVKvSCQi5QlRMy/sZkMiE3NxcDBgzAvHnzFOffacr8+fPx+uuvs7/Xrl0rpjmM0wLbir2v8UjmaDvGsIelox81ahTzRvF2XFhWVoYPP/xQKHvNjzuVTMjwHjJ6vd6rWdGLFy8K9QXr6+tx7tw5nDhxAhs3bkRdnVxAJy8vD/v27WvmjK2UF198ET/99BML+8rLy0NcXJwcaR9/D1B+CBgQJpH2ZI42MV/+/EyLSZOOHTvmVQIotJbgyEPy8/PZORITE/1qJjU0NDgqKyubfYemYUlqyc7Obr1Nthd699uTOdpOKSlx5mO5ZpLyC+9KQ5sAZ1SFO9RMyADAK6+8wrbVREsostA1GiQmJmLr1q1C1SqTyYTXXnvN6/MvW7ZM+A5ZWVnics5tt5M5GpbjQvNXwKkaoL+z0Mu0adPYOtfOnTsVR1W4i85X6yFjNBqZw3dMTIzoIZO/yhkbGellVaTuMUCXaGcdjfh7mJvdrFmzcPnyZZaqIjc3F3PnzlVVLcqFJElYsWIFfvzxR1YGrqioSHW+VRJhKFG+l4mQH7cVFBRg5cqVilIR3nXXXYiNjcXp06fZPrUeMps2bWLb6enpYlLf//0f5wPEl4wbBbyziqU7nD9/PtavX898XnNzc70Om5IkCZMmTWIijIyMDLvbjcxRd5TJVXt79+7NHJFtNhuqqqoUm3SPPPII+zsxMVGVh4zFYhFydvK5W1BuUF722pPXrr3AwHuZc3tTczgvL8/r2VIAuHz5cljfbiRCdybprmIhqoI3KQ8ePKj4lPy4UqiWqwA+IXFSUhIGcoU68c+3/NcWNgA5S4WHCB/qtWfPHrpnSIR+wAbgS7lWBZ9de+vWrYqjKvj1QrUeMnzp7OnTp8smcfVhZzZxf03ja+DMBcM9lPhQLXfZ2AgSoY9MUvkJz6/3VVRUoKGhQdGpoqOjodVqkZmZqTpkyVVARaPRiBMyxf8OTHtwoV78Q0VpiXGCROg5JSWsx+vZs6fQgxkMBsWny8jIUO0hw+cPnT17tjgh8/orgWmPfWJNRxcnT570ybiQREg0N8HMX0H64hjbxccHqikk+txzz6nykLFYLNi4cSP7W5hZLf534DxKuNSQUVFRbFxrMpnQ2NhI9wyJ0F9Pf6MwGcJPRih9+kdHR6uqslRWViaELAkuals3B+6hdEyeFe7SpYuQ1vDixYt0r5AI/USBnESpR48ebKnCZDLh66+/Dsgl8H6i2dnZ8oGak0BhceD8Km1gnkSRkZHo3LkzO8T7nhIkQt8+/XftFWoY8r2hGodupRiNRmH2UZiQWfmWLI5AvADgF2ePJ0mS4MBNPaF3BNxjpqyszOtqQYG94N1A8hQAzjUyV3az8vJyscClH+AnZLKzs8XIhdRHhRymgXkw3cw2b7rpJrb93XffhYwg1q9f32zfr7/+2n5FGBMTI4TCAM7ZPQByevigF+EeJsKmWdgsFovfHihWq1VIZzh16lTxPwwfCcK3vPnmm0IhUxd33HFH+zVH+bR+TYXoWvcKekpKhBqGLm8Rm82muIahEvgyZ2lpaWLZ6yAgLi4upAS4Zs0at2W/tVotli1b1n57wtGjR0Ov1wuZy1yMHz8elZWVQXdzNRsXmr8SahimpqayvDE7d+5UXMPQE+x2u2AWnT17Fs8//zyuXr0aHBMJHTpg37598pxNO18nLC0tZRaaO3F6EykSFGPCpKSkFoU4bNgwHDlyJOjyZTZjl55FEgwePFjevWuXXAjUxxMyfHZuo9EoJPkNNs6fP9+uBeju3gScThn8EKRdmqO8EPkwHJ6RI0eqCpYNKEZZEHzPbTKZ8MUXX/j8495//30aoAXiZzUaWxSgXq8PiAAD0hO6SE9Px4ULF4T65S5TZvr06SgqKgreWdPKz4Bva4E4LSRJQlpaGnOo3r9/v097covFIjhrZ2dnCzUdgg273S5YB+2F6upqTJgwwe2xTZs2+WWY0eYiBJxBoVartdkMlMlkwowZM5oXkwyWcWHNGeD0t85MYNceKC6hFBQUYP78+T77uO3bt7MxVkxMDJYtW+ZzczfcsVgsSE1NdTuWzc/PD3hkf8AX65csWSJ6fnCmweLFi4P3l+NqGPID9dLSUsWhTa3Bp7bPzs4mAfqBGTNmsDQhPDk5OW2ydNYmHjPLli1zm+IhqN2fdhSzpYqEhATBobukpMQnH1FWViZ4yDz66KOkGD9w7NixZvsWLVokp1wMBxFKkoQXXnih/fxqrsTAXJoHXoQHDhzwycfwi/Nqk0ER14f3e+Xbu60g31ElHJej7fmBOz+OU4vVahWcG9QmgyLaHyRCJXxSLIwL+aiK77//3qtT8wVe1JZLI0iEoY0r1woXVdHUl1QtNptNmJBRWy6NIBGGB/tlzxVvaxi6OHz4sDAhozY7N0EiDA+McpoHvic0GAxiGWgFNB0L0oQMiZBojR3FbF2wS5cuzI2trq5OlfudxWIRZkVnzpwZdk0ajlm3eSgNvtJxobEK0vk6IE4LjUaDMWPGMOfqRYsW4d5771V0yjNnzgh/5+XlhZXvaEREhNt1OxIh0Tq79MDsecwkddXZ80W0Q0sxmASZowQPl/6PlhJ8SzjmMKWeUA2f7XVmHrv5Fmg0Guj1ely4cIHaxQfExsaSCAkPxoVffgN8cRwY6pyUCWTYC0HmKOGitITawO9dRAT1hEQr7Ch2VrQN89p6fiMyUnCYJxESzU1SY5XzRfi/rUmERLjeHASNCQmCREgQBImQIEiEBEGQCAmCREgQBImQIEiEBEGQCAmCREgQBImQIEiEBEGQCAmCREgQBImQIEiEBEGQCAmCREgQBImQIEiEBEGQCAmCREgQBImQIEiEBEGQCAmCREgQBImQINodwV+L4v+uOP+10Y9FqKAdVM0KfhHq+gG7PqGbiVDH3feQCL3m5luAsePpZiJoTEgQBImQIEiE/iYyMpJ+EcL/Y7COwTUKC6qrOXv2LEpLS3Hp0iW6Uwi/8dNPP5EIW8JoNGL8eJqEIcgcJQiCREgQJEKCIALEDQ6Hw9GWY0B/MWzYMOHvmJgYlJaWIioqin71IOfnn3/GgAEDmv1+BQUFfvvMgQMHQpKk8BOhX7/YDTc0+xEtFkubNTThOVarFV27dhX2abVaWCwWMkfbC3a73e3+y+3AmZegMSFBECRCgiAREgRBIiQIEmFIQg7i7YNOnTqF1fftGC5f9OLFiygpKaF1wnbAhQsXwur7huQ6od1uD7unaahD64QEQZAICYJESBBtyA8//BCy3y0kJ2YkSUJWVhY6dFD2jCksLERtba2wLyUlhWZVvaC+vh4VFRXCPp1Oh3Hjxik6z4033hi6jeQgGCkpKQ4AwuvUqVPUMF6g1+ubtWl2djY1DAeZo9ew2+1obGykhggAV69epUagMaF7E5YgSIQEQSIkCIJESBAkQoLwHREREdQI16EjNUHrHDx4EOfOnaOGUMnRo0epEUiE3jFt2jRqBILMUYIgERIEQSL0N3a7Hb/88gs1RACgqls0JnSLJEmYMmUKEhISfHK+qKgoHD9+HKWlpcL+zMxMZGRkBG07/P3vf292zUlJSejTp4/PxKPUeZtEGEa8+OKLPj1fUVFRsxu6T58+SEpKCto22LJlS7N9Tz31FCZPnkw3CJmj7dPE9WRfMHHlypV2d80kQoIgSIQEQSIkCIJESBAkQoIgSIQEQSIkCIJESBAkQqJVKKEU0RRyWwswZ86cgdlsduuZ0tZERESEdKZrEiEBAMjNzUVubi41BEHmKEGQCAmCIBESBI0JQ5zY2FikpaW16xlRu92O2NhY+jH9yP8D1DoMUVzqmy8AAAAASUVORK5CYII=";

// Grouped under one "Indstillinger" nav item to keep the main nav simple.
const SETTINGS_VIEWS = ["teams", "coachProfiles", "periods", "settings", "levels", "positionSettings", "formations", "aiPrompt", "versionHistory"];

const SETTINGS_TABS = [
  { key: "teams", label: "Hold", icon: Layers },
  { key: "coachProfiles", label: "Trænere", icon: UserCog },
  { key: "periods", label: "Perioder", icon: CalendarRange },
  { key: "settings", label: "Kriterier", icon: SlidersHorizontal },
  { key: "levels", label: "Niveauer", icon: BarChart3 },
  { key: "positionSettings", label: "Positionsopsætning", icon: Hash },
  { key: "formations", label: "Formationer", icon: LayoutGrid },
  { key: "aiPrompt", label: "AI-udkast", icon: Sparkles },
  { key: "versionHistory", label: "Versionshistorik", icon: History },
];

const CATEGORY_META = [
  { key: "technique", label: "Teknik", accent: "#E2231A", short: "TEK" },
  { key: "physical", label: "Fysisk", accent: "#1A1A1A", short: "FYS" },
  { key: "tactical", label: "Taktik", accent: "#5C6B73", short: "TAK" },
  { key: "mental", label: "Mentalt", accent: "#C9A24B", short: "MEN" },
];

const DEFAULT_SKILLS = {
  technique: ["Boldkontrol", "Afleveringer", "Driblinger", "Afslutninger", "Førsteberøring", "Indlæg"],
  physical: ["Hurtighed", "Styrke", "Udholdenhed", "Smidighed", "Balance", "Eksplosivitet"],
  tactical: ["Positionering", "Beslutningstagning", "Overblik", "Samarbejde", "Forsvarsspil", "Bevægelse uden bold"],
  mental: ["Selvtillid", "Ro", "Målrettethed", "Disciplin", "Kommunikation", "Lederskab"],
};

const EVAL_COLORS = ["#4A4A4A", "#E2231A"];
const GOAL_COLOR = "#1A1A1A";

function makeDefaultConfig() {
  const config = {};
  CATEGORY_META.forEach(({ key }) => {
    config[key] = DEFAULT_SKILLS[key].map((name, i) => ({
      id: `${key}-${i}`,
      name,
      enabled: true,
    }));
  });
  return config;
}

function scoreColor(v) {
  if (v == null) return "#D9D4C7";
  const colors = { 1: "#B5493F", 2: "#C9803F", 3: "#C9A24B", 4: "#7C9A5C", 5: "#2F5D46" };
  return colors[v] || "#D9D4C7";
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("da-DK", { month: "short", day: "numeric", year: "numeric" });
}

// log is already ordered oldest-first by the server (see self.js/bootstrap.js) —
// printed in that same order, per the coach's request, rather than only the
// latest value.
function formatProgressLog(log) {
  return log.map((e) => `${e.progress}/10 (${formatDate(String(e.createdAt).slice(0, 10))})`).join(", ");
}

function findSkillMeta(config, skillId) {
  for (const cat of CATEGORY_META) {
    const skill = (config[cat.key] || []).find((s) => s.id === skillId);
    if (skill) return { skill, category: cat };
  }
  return null;
}

// Every player belongs to exactly one skill group (e.g. "Standard" or
// "Målmand"). A skill can be a member of any number of groups (or none) —
// only skills that are members of the player's group ever apply to them,
// in every category. There's no fallback: a group with no members in a
// category simply shows nothing there.
function categorySkillsForPlayer(config, player, catKey) {
  const groupId = player?.skillGroupId;
  return (config[catKey] || []).filter(
    (s) => s.enabled && groupId && (s.groupIds || []).includes(groupId)
  );
}

function categoryAverage(config, scores, catKey, player) {
  const skills = categorySkillsForPlayer(config, player, catKey);
  if (skills.length === 0) return null;
  const vals = skills.map((s) => scores?.[s.id]).filter((v) => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function overallAverage(config, scores, player) {
  const cats = CATEGORY_META.map((c) => categoryAverage(config, scores, c.key, player)).filter(
    (v) => v != null
  );
  if (cats.length === 0) return null;
  return cats.reduce((a, b) => a + b, 0) / cats.length;
}

function categoryGoalAverage(config, goals, catKey, player) {
  const skillIds = categorySkillsForPlayer(config, player, catKey).map((s) => s.id);
  const targets = skillIds.map((id) => goals?.[id]?.target).filter((v) => typeof v === "number");
  if (targets.length === 0) return null;
  return targets.reduce((a, b) => a + b, 0) / targets.length;
}

function categoryTotal(config, scores, catKey, player) {
  const skills = categorySkillsForPlayer(config, player, catKey);
  const total = skills.reduce((sum, s) => sum + (scores?.[s.id] || 0), 0);
  const avg = skills.length ? total / skills.length : 0;
  return { total, avg, count: skills.length };
}

function sortedPeriods(periods) {
  return [...(periods || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function getPlayerScores(data, playerId, periodId) {
  return data.evaluations?.[playerId]?.[periodId]?.scores || {};
}

function getLatestScoredPeriod(data, playerId) {
  const periods = sortedPeriods(data.periods);
  for (let i = periods.length - 1; i >= 0; i--) {
    const scores = getPlayerScores(data, playerId, periods[i].id);
    if (Object.keys(scores).length > 0) return periods[i];
  }
  return periods.length ? periods[periods.length - 1] : null;
}

// Scans every goal across every period for this player and returns the
// single most recent self-evaluation entry (by submission time), or null if
// the player has never submitted one. Used on the roster card — a coach
// glancing down the list wants "when did she last self-evaluate, and what
// did she say", not a breakdown per goal.
function getLatestSelfEval(data, playerId) {
  const byPeriod = data.goals[playerId] || {};
  let latest = null;
  Object.values(byPeriod).forEach((bySkill) => {
    Object.values(bySkill).forEach((goal) => {
      (goal.progressLog || []).forEach((entry) => {
        if (!latest || entry.createdAt > latest.createdAt) latest = entry;
      });
    });
  });
  return latest;
}

// Goals, in the player's most recent period that has any, where the coach's
// current value and the player's latest self-evaluation are more than 2
// apart (on the 0-10 scale). Older periods are history, so they don't count.
// A goal with no coach value or no self-evaluation has nothing to compare.
const SELF_EVAL_GAP_LIMIT = 2;
function getSelfEvalGaps(data, playerId) {
  const byPeriod = data.goals[playerId] || {};
  const withGoals = sortedPeriods(data.periods).filter((pd) => Object.keys(byPeriod[pd.id] || {}).length > 0);
  const period = withGoals[withGoals.length - 1];
  if (!period) return [];
  const gaps = [];
  Object.keys(byPeriod[period.id]).forEach((skillId) => {
    const goal = byPeriod[period.id][skillId];
    const log = goal.progressLog || [];
    if (typeof goal.progress !== "number" || log.length === 0) return;
    const player = log[log.length - 1].progress; // log is oldest first
    if (Math.abs(goal.progress - player) > SELF_EVAL_GAP_LIMIT) {
      const meta = findSkillMeta(data.config, skillId);
      gaps.push({ name: meta ? meta.skill.name : "Mål", coach: goal.progress, player });
    }
  });
  return gaps;
}

function getUrlToken() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("player")) return params.get("player");
    const hash = window.location.hash.replace("#", "");
    const hashParams = new URLSearchParams(hash);
    if (hashParams.get("player")) return hashParams.get("player");
  } catch (e) {
    /* ignore */
  }
  return null;
}

// Same ?kampplan=<token> pattern as getUrlToken's ?player=<token>, for the
// public kampplan share link (see KpShareLinkCard / KampplanShareView).
function getKampplanShareToken() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("kampplan")) return params.get("kampplan");
  } catch (e) {
    /* ignore */
  }
  return null;
}

function CategoryAxisTick({ x, y, cx, cy, payload, index, onSelect }) {
  const cat = CATEGORY_META[index];
  if (!cat) return null;
  const anchor = x > cx + 2 ? "start" : x < cx - 2 ? "end" : "middle";
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      fill="#1A1A1A"
      fontSize={12}
      fontFamily="'Oswald', sans-serif"
      fontWeight={700}
      style={{ cursor: onSelect ? "pointer" : "default" }}
      onClick={() => onSelect && onSelect(cat.key)}
    >
      {payload.value}
    </text>
  );
}

function SkillDrilldownRadar({ config, catKey, player, scores, goals, onClose }) {
  const cat = CATEGORY_META.find((c) => c.key === catKey);
  if (!cat) return null;
  const skills = categorySkillsForPlayer(config, player, catKey);
  const data = skills.map((s) => ({
    subject: s.name,
    value: scores?.[s.id] || 0,
    goal: goals?.[s.id]?.target || 0,
  }));
  const hasAnyGoal = skills.some((s) => goals?.[s.id]?.target);

  return (
    <div style={styles.radarCard}>
      <div style={styles.drilldownHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ ...styles.dot, background: cat.accent }} />
          <span style={styles.categoryLabel}>{cat.label} — detaljer</span>
        </div>
        <button style={styles.iconBtnGhost} onClick={onClose} title="Luk">
          <X size={16} />
        </button>
      </div>
      {skills.length === 0 ? (
        <div style={styles.noSkills}>Ingen aktive kriterier i denne kategori.</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data} outerRadius="65%">
            <PolarGrid stroke="#D9D4C7" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#1A1A1A", fontSize: 11, fontFamily: "'Inter', sans-serif" }}
            />
            <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
            <Radar
              name="Score"
              dataKey="value"
              stroke={cat.accent}
              fill={cat.accent}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
            {hasAnyGoal && (
              <Radar
                name="Mål"
                dataKey="goal"
                stroke={GOAL_COLOR}
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 4"
                isAnimationActive={false}
              />
            )}
            {hasAnyGoal && (
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
            )}
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// One primary position (required to have a value once set — a coach can
// still leave it empty) and one optional secondary, both drawn from the
// same 11-slot formation catalog (see client/src/positions.js). Replaces
// the old free-tag PositionPicker that let a coach stack up any number of
// letter/number tags with no primary/secondary distinction.
function PositionFields({ primaryPosition, secondaryPosition, onChangePrimary, onChangeSecondary }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={styles.fieldLabel}>Primær position</div>
        <select
          style={styles.select}
          value={primaryPosition || ""}
          onChange={(e) => {
            const value = e.target.value || null;
            onChangePrimary(value);
            // A position can't be both primary and secondary at once.
            if (value && value === secondaryPosition) onChangeSecondary(null);
          }}
        >
          <option value="">Vælg position</option>
          {POSITION_CATALOG.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={styles.fieldLabel}>Sekundær position</div>
        <select
          style={styles.select}
          value={secondaryPosition || ""}
          onChange={(e) => onChangeSecondary(e.target.value || null)}
        >
          <option value="">Ingen</option>
          {POSITION_CATALOG.filter((p) => p.id !== primaryPosition).map((p) => (
            <option key={p.id} value={p.id}>
              {p.id}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  {
    key: "roster",
    label: "Spillertrup",
    icon: Users,
    isActive: (v) => v === "roster" || v === "player",
    select: (setView, setSelectedId) => {
      setView("roster");
      setSelectedId(null);
    },
  },
  {
    key: "coaches",
    label: "Overblik",
    icon: ClipboardList,
    isActive: (v) => v === "coaches",
    select: (setView) => setView("coaches"),
  },
  {
    key: "followupsLog",
    label: "Opfølgninger",
    icon: History,
    isActive: (v) => v === "followupsLog",
    select: (setView) => setView("followupsLog"),
  },
  {
    key: "matchPlans",
    label: "Kampplan",
    icon: Swords,
    isActive: (v) => v === "matchPlans",
    select: (setView) => setView("matchPlans"),
  },
  {
    key: "kampScore",
    label: "Kampscore",
    icon: TrendingUp,
    isActive: (v) => v === "kampScore",
    select: (setView) => setView("kampScore"),
  },
  {
    key: "statistik",
    label: "Statistik",
    icon: BarChart3,
    isActive: (v) => v === "statistik",
    select: (setView) => setView("statistik"),
  },
  {
    key: "positionOverview",
    label: "Positioner",
    icon: LayoutGrid,
    isActive: (v) => v === "positionOverview",
    select: (setView) => setView("positionOverview"),
  },
  {
    key: "settings",
    label: "Indstillinger",
    icon: Settings,
    isActive: (v) => SETTINGS_VIEWS.includes(v),
    select: (setView) => setView("teams"),
  },
];

function ClubHeader({ view, setView, setSelectedId, coach, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const current = NAV_ITEMS.find((item) => item.isActive(view)) || NAV_ITEMS[0];
  const CurrentIcon = current.icon;

  const selectItem = (item) => {
    item.select(setView, setSelectedId);
    setMenuOpen(false);
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerTopBar}>
        <div style={styles.headerTopRow}>
          <div style={styles.brand}>
            <span style={styles.brandText}>VB PIGE AKADEMI</span>
            <span style={styles.brandSub}>Spillerudvikling</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {coach && (
              <button style={styles.logoutBtn} onClick={onLogout} title="Log ud">
                <span style={styles.coachNameTag}>{coach.name}</span>
                <LogOut size={14} />
              </button>
            )}
            <img src={LOGO_SRC} alt="Klublogo" style={styles.logoImg} />
          </div>
        </div>
      </div>
      <div style={styles.headerNavBar}>
        <div style={styles.headerNavBarRow}>
          <div style={{ position: "relative" }}>
            <button style={styles.menuTriggerBtn} onClick={() => setMenuOpen((v) => !v)}>
              <Menu size={18} />
              <CurrentIcon size={16} />
              <span>{current.label}</span>
              <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <>
                <div style={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
                <div style={styles.menuDropdown}>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = item.isActive(view);
                    return (
                      <button
                        key={item.key}
                        style={{
                          ...styles.menuDropdownItem,
                          ...(active ? styles.menuDropdownItemActive : {}),
                        }}
                        onClick={() => selectItem(item)}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={styles.headerStripes} />
    </header>
  );
}

// Shared shell for the two screens shown before any coach is logged in —
// same dark full-bleed background + centered card as the loading screen,
// so the very first thing a coach sees doesn't look like a different app.
function AuthShell({ title, subtitle, children }) {
  return (
    <div style={styles.authWrap}>
      <img src={LOGO_SRC} alt="Klublogo" style={{ width: 56, height: 56, marginBottom: 4 }} />
      <div style={styles.authCard}>
        <h1 style={styles.authTitle}>{title}</h1>
        {subtitle && <p style={styles.authSubtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

// Shown once, exactly when the coaches table is empty (a brand new install
// or a fresh migration) — see GET /api/auth/status. After this succeeds
// there is always at least one coach, so it never shows again; every coach
// after the first is created from the (login-protected) Trænere screen.
// claimableCoaches is non-empty exactly when this app had coach rows
// already (created back when there was no login), so setup means "claim
// one of these by setting its first password" rather than "create the
// very first account from scratch". Either path lands here; a coach with
// no matching row yet can still fall back to creating a new one.
function SetupScreen({ onSuccess, claimableCoaches }) {
  const [claiming, setClaiming] = useState(null); // the coach being claimed, or null
  const [creatingNew, setCreatingNew] = useState(claimableCoaches.length === 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const startClaim = (coach) => {
    setClaiming(coach);
    setEmail(coach.email || "");
    setPassword("");
    setError("");
  };

  const submitClaim = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const coach = await api.setupAccount({ claimCoachId: claiming.id, email: email.trim(), password });
      onSuccess(coach);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const coach = await api.setupAccount({ name: name.trim(), email: email.trim(), password });
      onSuccess(coach);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (claiming) {
    return (
      <AuthShell title="Vælg en adgangskode" subtitle={`Til ${claiming.name}s konto.`}>
        <form onSubmit={submitClaim}>
          {error && <div style={styles.errorBannerRow}>{error}</div>}
          <div style={{ marginBottom: 12 }}>
            <div style={styles.fieldLabel}>E-mail</div>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={styles.fieldLabel}>Adgangskode (mindst 6 tegn)</div>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <button style={{ ...styles.primaryBtn, width: "100%", justifyContent: "center" }} disabled={submitting}>
            {submitting ? "Gemmer…" : "Sæt adgangskode og log ind"}
          </button>
          <button
            type="button"
            style={{ ...styles.linkBtn, marginTop: 12, justifyContent: "center", width: "100%" }}
            onClick={() => setClaiming(null)}
          >
            Tilbage
          </button>
        </form>
      </AuthShell>
    );
  }

  if (!creatingNew) {
    return (
      <AuthShell
        title="Velkommen til VB Pige Akademi"
        subtitle="Login er nyt her — vælg din eksisterende trænerkonto for at sætte en adgangskode. Dine registrerede opfølgninger og andet er uændret."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {claimableCoaches.map((c) => (
            <button
              key={c.id}
              type="button"
              style={styles.claimCoachBtn}
              onClick={() => startClaim(c)}
            >
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={styles.subtext}>{c.email || "Ingen e-mail registreret"}</div>
            </button>
          ))}
        </div>
        <button
          type="button"
          style={{ ...styles.linkBtn, marginTop: 16, justifyContent: "center", width: "100%" }}
          onClick={() => setCreatingNew(true)}
        >
          Ingen af disse er mig — opret en ny konto
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Velkommen til VB Pige Akademi"
      subtitle="Opret en trænerkonto herunder. Flere trænere kan tilføjes bagefter under Indstillinger → Trænere."
    >
      <form onSubmit={submitCreate}>
        {error && <div style={styles.errorBannerRow}>{error}</div>}
        <div style={{ marginBottom: 12 }}>
          <div style={styles.fieldLabel}>Navn</div>
          <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={styles.fieldLabel}>E-mail</div>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={styles.fieldLabel}>Adgangskode (mindst 6 tegn)</div>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <button style={{ ...styles.primaryBtn, width: "100%", justifyContent: "center" }} disabled={submitting}>
          {submitting ? "Opretter…" : "Opret konto og log ind"}
        </button>
        {claimableCoaches.length > 0 && (
          <button
            type="button"
            style={{ ...styles.linkBtn, marginTop: 12, justifyContent: "center", width: "100%" }}
            onClick={() => setCreatingNew(false)}
          >
            Tilbage til listen over eksisterende trænere
          </button>
        )}
      </form>
    </AuthShell>
  );
}

function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const coach = await api.login({ email: email.trim(), password });
      onSuccess(coach);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="VB Pige Akademi" subtitle="Log ind for at fortsætte.">
      <form onSubmit={submit}>
        {error && <div style={styles.errorBannerRow}>{error}</div>}
        <div style={{ marginBottom: 12 }}>
          <div style={styles.fieldLabel}>E-mail</div>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={styles.fieldLabel}>Adgangskode</div>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button style={{ ...styles.primaryBtn, width: "100%", justifyContent: "center" }} disabled={submitting}>
          {submitting ? "Logger ind…" : "Log ind"}
        </button>
      </form>
    </AuthShell>
  );
}

function SettingsSubNav({ view, setView }) {
  return (
    <div style={styles.teamFilterRow}>
      {SETTINGS_TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          style={{
            ...styles.teamFilterChip,
            ...(view === key ? styles.teamFilterChipActive : {}),
          }}
          onClick={() => setView(key)}
        >
          <Icon size={14} /> {label}
        </button>
      ))}
    </div>
  );
}

export default function AcademyApp() {
  const [data, setData] = useState(null);
  const [selfData, setSelfData] = useState(null);
  const [selfInvalid, setSelfInvalid] = useState(false);
  const [kampplanShareData, setKampplanShareData] = useState(null);
  const [kampplanShareInvalid, setKampplanShareInvalid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [view, setView] = useState("roster");
  const [selectedId, setSelectedId] = useState(null);
  // Which list ("roster" or "coaches") a player was opened from, so "back"
  // returns to that list instead of always Spillertrup — and where each
  // list's scroll position was when it was left, so "back" restores it
  // instead of landing back at the top. Scroll position is a ref (not
  // state) since restoring it is a DOM side effect, not something a
  // re-render should reflect. pendingScrollRestoreRef does double duty:
  // set to a saved list position when going back, or to 0 when opening a
  // player (a player page should always start at the top, never inherit
  // wherever the list happened to be scrolled to).
  const [playerOriginView, setPlayerOriginView] = useState("roster");
  const scrollPositionsRef = React.useRef({});
  const pendingScrollRestoreRef = React.useRef(null);

  useEffect(() => {
    if (pendingScrollRestoreRef.current != null) {
      // No rAF wrapper — rAF is throttled to near-zero on a backgrounded/
      // hidden tab, and by the time this effect runs the DOM has already
      // committed and painted, so scrolling immediately is both simpler
      // and more reliable.
      window.scrollTo(0, pendingScrollRestoreRef.current);
      pendingScrollRestoreRef.current = null;
    }
  }, [view]);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrimaryPosition, setNewPrimaryPosition] = useState(null);
  const [newSecondaryPosition, setNewSecondaryPosition] = useState(null);
  const [newNumber, setNewNumber] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTeamId, setNewTeamId] = useState("");
  const [newSkillGroupId, setNewSkillGroupId] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [urlToken] = useState(getUrlToken);
  const [kampplanToken] = useState(getKampplanShareToken);
  // null while checking; otherwise { setupNeeded, coach } — coach is null
  // when logged out. Only relevant off the self-eval/kampplan-share links:
  // neither player-facing link touches this, skipping straight to
  // api.getSelf / api.getMatchPlanShare.
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (kampplanToken) {
          // Kampplan share link: one plan's player-facing fields only, no
          // login, no roster — see server/routes/matchPlanShare.js.
          const result = await api.getMatchPlanShare(kampplanToken);
          setKampplanShareData(result);
        } else if (urlToken) {
          // Self-eval link: fetch only this one player's scoped data, never
          // the full roster, and never touches coach auth — the server
          // enforces the token match on its own, with no login involved.
          const result = await api.getSelf(urlToken);
          setSelfData(result);
        } else {
          const status = await api.getAuthStatus();
          setAuthStatus(status);
          if (!status.setupNeeded && status.coach) {
            const result = await api.getBootstrap();
            setData(result);
          }
        }
      } catch (e) {
        if (kampplanToken) {
          setKampplanShareInvalid(true);
        } else if (urlToken) {
          setSelfInvalid(true);
        }
        // Off either player-facing link, leaving authStatus/data unset here
        // is deliberate: a failed status check (server unreachable) falls
        // through to the login screen's own error state on next attempt
        // rather than a silently empty roster.
      } finally {
        setLoading(false);
      }
    })();
  }, [urlToken, kampplanToken]);

  // Called by LoginScreen/SetupScreen once the server confirms a session;
  // loads the real roster right after, so the coach lands in the app
  // itself rather than on a second blank beat.
  const handleAuthed = async (coach) => {
    setAuthStatus({ setupNeeded: false, coach });
    setLoading(true);
    try {
      const result = await api.getBootstrap();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () =>
    runMutation(async () => {
      await api.logout();
      setData(null);
      setAuthStatus({ setupNeeded: false, coach: null });
    });

  useEffect(() => {
    if (!newSkillGroupId && data?.config?.groups?.length) {
      setNewSkillGroupId(data.config.groups[0].id);
    }
  }, [data, newSkillGroupId]);

  const runMutation = useCallback(async (action) => {
    try {
      await action();
      setSaveError(false);
      return true;
    } catch (e) {
      // The session expired (or was revoked) mid-use — send the coach back
      // to the login screen instead of a generic save-failed banner they
      // can't act on.
      if (e.message === "Not authenticated") {
        setData(null);
        setAuthStatus({ setupNeeded: false, coach: null });
        return false;
      }
      setSaveError(true);
      return false;
    }
  }, []);

  // values: { [skillId]: 1-10 } for every goal in the period (the server
  // refuses anything less). Resolves true/false for whether it was saved.
  const submitSelfEval = (periodId, values) =>
    runMutation(async () => {
      const { goals: updated } = await api.submitSelfEval(urlToken, periodId, values);
      const existingPeriod = selfData.goals[periodId] || {};
      const merged = { ...existingPeriod };
      Object.keys(updated).forEach((skillId) => {
        merged[skillId] = { ...existingPeriod[skillId], ...updated[skillId] };
      });
      setSelfData({ ...selfData, goals: { ...selfData.goals, [periodId]: merged } });
    });

  const setGoalProgress = (playerId, periodId, subskillId, progress) =>
    runMutation(async () => {
      const existingPlayer = data.goals[playerId] || {};
      const existingPeriod = existingPlayer[periodId] || {};
      const prevGoal = existingPeriod[subskillId];
      if (!prevGoal) return;
      const updated = await api.setGoalProgress(playerId, periodId, subskillId, progress);
      const goals = {
        ...data.goals,
        [playerId]: {
          ...existingPlayer,
          [periodId]: { ...existingPeriod, [subskillId]: { ...prevGoal, ...updated } },
        },
      };
      setData({ ...data, goals });
    });

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <img src={LOGO_SRC} alt="Klublogo" style={{ width: 56, height: 56, marginBottom: 4 }} />
        <div style={{ color: "#FFFFFF", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
          INDLÆSER TRUP…
        </div>
      </div>
    );
  }

  // Player self-evaluation via private link — restricted to a single player, no roster access.
  // The server scopes /api/self/:token to this one player only, so no other
  // player's data is ever fetched into this browser.
  if (kampplanToken) {
    if (kampplanShareInvalid || !kampplanShareData) {
      return (
        <div style={styles.app}>
          <div style={styles.headerTopBar}>
            <div style={styles.headerTopRow}>
              <div style={styles.brand}>
                <span style={styles.brandText}>VB PIGE AKADEMI</span>
              </div>
              <img src={LOGO_SRC} alt="Klublogo" style={styles.logoImg} />
            </div>
          </div>
          <div style={{ ...styles.main, textAlign: "center", paddingTop: 60 }}>
            <Lock size={32} color="#B9B2A0" />
            <div style={{ marginTop: 12, fontWeight: 700, fontSize: 18 }}>Ugyldigt link</div>
            <p style={styles.subtext}>
              Dette link er ugyldigt eller ikke længere aktivt. Kontakt din træner for at få et
              nyt link.
            </p>
          </div>
        </div>
      );
    }
    return <KampplanShareView plan={kampplanShareData} />;
  }

  if (urlToken) {
    if (selfInvalid || !selfData) {
      return (
        <div style={styles.app}>
          <div style={styles.headerTopBar}>
            <div style={styles.headerTopRow}>
              <div style={styles.brand}>
                <span style={styles.brandText}>VB PIGE AKADEMI</span>
              </div>
              <img src={LOGO_SRC} alt="Klublogo" style={styles.logoImg} />
            </div>
          </div>
          <div style={{ ...styles.main, textAlign: "center", paddingTop: 60 }}>
            <Lock size={32} color="#B9B2A0" />
            <div style={{ marginTop: 12, fontWeight: 700, fontSize: 18 }}>Ugyldigt link</div>
            <p style={styles.subtext}>
              Dette link er ugyldigt eller ikke længere aktivt. Kontakt din træner for at få et
              nyt link.
            </p>
          </div>
        </div>
      );
    }
    return (
      <PlayerSelfEvalApp
        player={selfData.player}
        config={selfData.config}
        periods={sortedPeriods(selfData.periods)}
        coachEvaluations={selfData.evaluations}
        goals={selfData.goals}
        developmentPlan={selfData.developmentPlan}
        onSubmitSelfEval={submitSelfEval}
      />
    );
  }

  if (authStatus?.setupNeeded)
    return <SetupScreen onSuccess={handleAuthed} claimableCoaches={authStatus.claimableCoaches || []} />;
  if (!authStatus?.coach) return <LoginScreen onSuccess={handleAuthed} />;

  if (!data) return null;

  const addPlayer = () =>
    runMutation(async () => {
      if (!newName.trim() || !newSkillGroupId) return;
      const created = await api.createPlayer({
        name: newName.trim(),
        primaryPosition: newPrimaryPosition,
        secondaryPosition: newSecondaryPosition,
        number: newNumber.trim(),
        email: newEmail.trim(),
        teamId: newTeamId || null,
        skillGroupId: newSkillGroupId,
      });
      setData({ ...data, players: [...data.players, created] });
      setNewName("");
      setNewPrimaryPosition(null);
      setNewSecondaryPosition(null);
      setNewNumber("");
      setNewEmail("");
      setNewTeamId("");
      setNewSkillGroupId("");
      setAddingPlayer(false);
    });

  const deletePlayer = (id) =>
    runMutation(async () => {
      await api.deletePlayer(id);
      const players = data.players.filter((p) => p.id !== id);
      const evaluations = { ...data.evaluations };
      delete evaluations[id];
      const goals = { ...data.goals };
      delete goals[id];
      setData({ ...data, players, evaluations, goals });
      setConfirmDelete(null);
      if (selectedId === id) {
        setView("roster");
        setSelectedId(null);
      }
    });

  const updatePlayerPositions = (playerId, patch) =>
    runMutation(async () => {
      await api.updatePlayer(playerId, patch);
      const players = data.players.map((p) => (p.id === playerId ? { ...p, ...patch } : p));
      setData({ ...data, players });
    });

  const updatePlayerTeam = (playerId, teamId) =>
    runMutation(async () => {
      await api.updatePlayer(playerId, { teamId: teamId || null });
      const players = data.players.map((p) =>
        p.id === playerId ? { ...p, teamId: teamId || null } : p
      );
      setData({ ...data, players });
    });

  const updatePlayerActive = (playerId, active) =>
    runMutation(async () => {
      await api.updatePlayer(playerId, { active });
      const players = data.players.map((p) => (p.id === playerId ? { ...p, active } : p));
      setData({ ...data, players });
    });

  const updatePlayerEmail = (playerId, email) =>
    runMutation(async () => {
      await api.updatePlayer(playerId, { email });
      const players = data.players.map((p) => (p.id === playerId ? { ...p, email } : p));
      setData({ ...data, players });
    });

  const updatePlayerNumber = (playerId, number) =>
    runMutation(async () => {
      await api.updatePlayer(playerId, { number });
      const players = data.players.map((p) => (p.id === playerId ? { ...p, number } : p));
      setData({ ...data, players });
    });

  const updatePlayerParticipationLevel = (playerId, participationLevelId) =>
    runMutation(async () => {
      await api.updatePlayer(playerId, { participationLevelId: participationLevelId || null });
      const players = data.players.map((p) =>
        p.id === playerId ? { ...p, participationLevelId: participationLevelId || null } : p
      );
      setData({ ...data, players });
    });

  const updatePlayerGoalHorizons = (playerId, patch) =>
    runMutation(async () => {
      await api.updatePlayer(playerId, patch);
      const players = data.players.map((p) => (p.id === playerId ? { ...p, ...patch } : p));
      setData({ ...data, players });
    });

  const saveDevelopmentPlan = (playerId, plan) =>
    runMutation(async () => {
      const saved = await api.saveDevelopmentPlan(playerId, plan);
      const developmentPlans = { ...data.developmentPlans, [playerId]: saved };
      setData({ ...data, developmentPlans });
    });

  const createParticipationLevel = (name, numericValue) =>
    runMutation(async () => {
      const created = await api.createParticipationLevel({ name, numericValue, expectations: "" });
      const config = { ...data.config };
      config.participationLevels = [...(config.participationLevels || []), created];
      setData({ ...data, config });
    });

  const updateParticipationLevel = (id, patch) =>
    runMutation(async () => {
      const updated = await api.updateParticipationLevel(id, patch);
      const config = { ...data.config };
      config.participationLevels = config.participationLevels.map((l) =>
        l.id === id ? updated : l
      );
      setData({ ...data, config });
    });

  const deleteParticipationLevel = (id) =>
    runMutation(async () => {
      await api.deleteParticipationLevel(id);
      const config = { ...data.config };
      config.participationLevels = config.participationLevels.filter((l) => l.id !== id);
      const players = data.players.map((p) =>
        p.participationLevelId === id ? { ...p, participationLevelId: null } : p
      );
      setData({ ...data, config, players });
    });

  const createTeam = async (name) => {
    let created = null;
    await runMutation(async () => {
      created = await api.createTeam(name || "Nyt hold");
      setData({ ...data, teams: [...data.teams, created] });
    });
    return created ? created.id : null;
  };

  const renameTeam = (teamId, name) =>
    runMutation(async () => {
      await api.renameTeam(teamId, name);
      const teams = data.teams.map((t) => (t.id === teamId ? { ...t, name } : t));
      setData({ ...data, teams });
    });

  const deleteTeam = (teamId) =>
    runMutation(async () => {
      await api.deleteTeam(teamId);
      const teams = data.teams.filter((t) => t.id !== teamId);
      const players = data.players.map((p) => (p.teamId === teamId ? { ...p, teamId: null } : p));
      setData({ ...data, teams, players });
    });

  const createPeriod = async (label, date) => {
    let created = null;
    await runMutation(async () => {
      created = await api.createPeriod(label || "Ny periode", date || todayStr());
      setData({ ...data, periods: [...data.periods, created] });
    });
    return created ? created.id : null;
  };

  const renamePeriod = (periodId, label, date) =>
    runMutation(async () => {
      await api.renamePeriod(periodId, label, date);
      const periods = data.periods.map((p) => (p.id === periodId ? { ...p, label, date } : p));
      setData({ ...data, periods });
    });

  const deletePeriod = (periodId) =>
    runMutation(async () => {
      await api.deletePeriod(periodId);
      const periods = data.periods.filter((p) => p.id !== periodId);
      const evaluations = {};
      Object.keys(data.evaluations).forEach((playerId) => {
        const playerEvals = { ...data.evaluations[playerId] };
        delete playerEvals[periodId];
        evaluations[playerId] = playerEvals;
      });
      setData({ ...data, periods, evaluations });
    });

  const setScore = (playerId, periodId, subskillId, value) =>
    runMutation(async () => {
      const playerEvals = { ...(data.evaluations[playerId] || {}) };
      const current = playerEvals[periodId]?.scores || {};
      const scores = { ...current };
      scores[subskillId] = scores[subskillId] === value ? undefined : value;
      if (scores[subskillId] === undefined) delete scores[subskillId];
      playerEvals[periodId] = { scores };
      const evaluations = { ...data.evaluations, [playerId]: playerEvals };
      await api.setScore(playerId, periodId, subskillId, scores[subskillId]);
      setData({ ...data, evaluations });
    });

  const setGoal = (playerId, periodId, subskillId, target, note, focusAreas) =>
    runMutation(async () => {
      const updated = await api.setGoal(playerId, periodId, subskillId, target, note, focusAreas);
      const existingPlayer = data.goals[playerId] || {};
      const existingPeriod = existingPlayer[periodId] || {};
      const goals = {
        ...data.goals,
        [playerId]: {
          ...existingPlayer,
          [periodId]: { ...existingPeriod, [subskillId]: updated },
        },
      };
      setData({ ...data, goals });
    });

  const removeGoal = (playerId, periodId, subskillId) =>
    runMutation(async () => {
      await api.removeGoal(playerId, periodId, subskillId);
      const existingPlayer = { ...(data.goals[playerId] || {}) };
      const existingPeriod = { ...(existingPlayer[periodId] || {}) };
      delete existingPeriod[subskillId];
      existingPlayer[periodId] = existingPeriod;
      const goals = { ...data.goals, [playerId]: existingPlayer };
      setData({ ...data, goals });
    });

  const renameSkill = (catKey, skillId, name) =>
    runMutation(async () => {
      await api.renameSkill(skillId, name);
      const config = { ...data.config };
      config[catKey] = config[catKey].map((s) => (s.id === skillId ? { ...s, name } : s));
      setData({ ...data, config });
    });

  const toggleSkill = (catKey, skillId) =>
    runMutation(async () => {
      const current = data.config[catKey].find((s) => s.id === skillId);
      await api.toggleSkill(skillId, !current.enabled);
      const config = { ...data.config };
      config[catKey] = config[catKey].map((s) =>
        s.id === skillId ? { ...s, enabled: !s.enabled } : s
      );
      setData({ ...data, config });
    });

  const createSkill = (catKey, groupId, name) =>
    runMutation(async () => {
      const created = await api.createSkill({ categoryKey: catKey, groupId, name });
      const config = { ...data.config };
      config[catKey] = [...config[catKey], created];
      setData({ ...data, config });
    });

  const addSkillToGroup = (catKey, skillId, groupId) =>
    runMutation(async () => {
      await api.addSkillToGroup(groupId, skillId);
      const config = { ...data.config };
      config[catKey] = config[catKey].map((s) =>
        s.id === skillId ? { ...s, groupIds: [...s.groupIds, groupId] } : s
      );
      setData({ ...data, config });
    });

  const removeSkillFromGroup = (catKey, skillId, groupId) =>
    runMutation(async () => {
      await api.removeSkillFromGroup(groupId, skillId);
      const config = { ...data.config };
      config[catKey] = config[catKey].map((s) =>
        s.id === skillId ? { ...s, groupIds: s.groupIds.filter((id) => id !== groupId) } : s
      );
      setData({ ...data, config });
    });

  const createSkillGroup = (name) =>
    runMutation(async () => {
      const created = await api.createSkillGroup(name);
      const config = { ...data.config };
      config.groups = [...config.groups, created];
      setData({ ...data, config });
    });

  const renameSkillGroup = (groupId, name) =>
    runMutation(async () => {
      await api.renameSkillGroup(groupId, name);
      const config = { ...data.config };
      config.groups = config.groups.map((g) => (g.id === groupId ? { ...g, name } : g));
      setData({ ...data, config });
    });

  const deleteSkillGroup = (groupId) =>
    runMutation(async () => {
      await api.deleteSkillGroup(groupId);
      const config = { ...data.config };
      config.groups = config.groups.filter((g) => g.id !== groupId);
      CATEGORY_META.forEach((cat) => {
        config[cat.key] = config[cat.key].map((s) => ({
          ...s,
          groupIds: s.groupIds.filter((id) => id !== groupId),
        }));
      });
      setData({ ...data, config });
    });

  const updatePlayerSkillGroup = (playerId, skillGroupId) =>
    runMutation(async () => {
      await api.updatePlayer(playerId, { skillGroupId });
      const players = data.players.map((p) => (p.id === playerId ? { ...p, skillGroupId } : p));
      setData({ ...data, players });
    });

  // Coach create/update/delete have real, user-fixable validation errors
  // (duplicate e-mail, too-short password, "can't delete the last coach")
  // — unlike runMutation's other callers, these need to reach CoachesView's
  // own inline error display rather than being swallowed into the generic
  // "couldn't save" banner. The one thing still worth sharing with
  // runMutation is the "session expired" redirect.
  const withCoachAuthRedirect = async (fn) => {
    try {
      return await fn();
    } catch (e) {
      if (e.message === "Not authenticated") {
        setData(null);
        setAuthStatus({ setupNeeded: false, coach: null });
      }
      throw e;
    }
  };

  const createCoach = (name, email, teamId, password) =>
    withCoachAuthRedirect(async () => {
      const created = await api.createCoach({ name, email, teamId, password });
      setData({ ...data, coaches: [...(data.coaches || []), created] });
      return created;
    });

  const updateCoach = (coachId, patch) =>
    withCoachAuthRedirect(async () => {
      const updated = await api.updateCoach(coachId, patch);
      const coaches = (data.coaches || []).map((c) => (c.id === coachId ? updated : c));
      setData({ ...data, coaches });
    });

  const deleteCoach = (coachId) =>
    withCoachAuthRedirect(async () => {
      await api.deleteCoach(coachId);
      const coaches = (data.coaches || []).filter((c) => c.id !== coachId);
      const followups = {};
      Object.keys(data.followups || {}).forEach((playerId) => {
        followups[playerId] = data.followups[playerId].map((f) =>
          f.coachId === coachId ? { ...f, coachId: null } : f
        );
      });
      setData({ ...data, coaches, followups });
    });

  const addFollowup = (playerId, coachId, note) =>
    runMutation(async () => {
      const created = await api.createFollowup(playerId, coachId, note);
      const followups = {
        ...data.followups,
        [playerId]: [...(data.followups?.[playerId] || []), created],
      };
      setData({ ...data, followups });
    });

  const removeFollowup = (playerId, followupId) =>
    runMutation(async () => {
      await api.deleteFollowup(playerId, followupId);
      const followups = {
        ...data.followups,
        [playerId]: (data.followups?.[playerId] || []).filter((f) => f.id !== followupId),
      };
      setData({ ...data, followups });
    });

  const selectedPlayer = data.players.find((p) => p.id === selectedId);
  const periods = sortedPeriods(data.periods);
  // Inactive players only exist in the squad list (RosterView) and on their
  // own page; every other view gets this copy so they can't be picked there.
  // Their evaluations, goals and followups stay in `data`, untouched.
  const activeData = { ...data, players: data.players.filter((p) => p.active !== false) };

  return (
    <div style={styles.app}>
      <PrintStyles />
      <ClubHeader
        view={view}
        setView={setView}
        setSelectedId={setSelectedId}
        coach={authStatus.coach}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        {saveError && (
          <div style={styles.errorBanner}>
            Kunne ikke gemme ændringer — tjek din forbindelse og prøv igen.
          </div>
        )}

        {SETTINGS_VIEWS.includes(view) && <SettingsSubNav view={view} setView={setView} />}

        {view === "settings" && (
          <SettingsView
            config={data.config}
            onRename={renameSkill}
            onToggle={toggleSkill}
            onCreateSkill={createSkill}
            onAddSkillToGroup={addSkillToGroup}
            onRemoveSkillFromGroup={removeSkillFromGroup}
            onCreateGroup={createSkillGroup}
            onRenameGroup={renameSkillGroup}
            onDeleteGroup={deleteSkillGroup}
          />
        )}

        {view === "levels" && (
          <ParticipationLevelsView
            levels={data.config.participationLevels || []}
            onCreate={createParticipationLevel}
            onUpdate={updateParticipationLevel}
            onDelete={deleteParticipationLevel}
          />
        )}

        {view === "positionSettings" && <PositionSettingsView />}

        {view === "formations" && <FormationsSettingsView />}

        {view === "aiPrompt" && <AiPromptView />}

        {view === "versionHistory" && <VersionHistoryView />}

        {view === "coaches" && (
          <CoachesOverviewView
            data={activeData}
            onSetGoalProgress={setGoalProgress}
            onOpenPlayer={(id) => {
              scrollPositionsRef.current.coaches = window.scrollY;
              pendingScrollRestoreRef.current = 0;
              setPlayerOriginView("coaches");
              setSelectedId(id);
              setView("player");
            }}
            onAddFollowup={addFollowup}
            onRemoveFollowup={removeFollowup}
          />
        )}

        {view === "coachProfiles" && (
          <CoachesView
            coaches={data.coaches || []}
            teams={data.teams}
            onCreate={createCoach}
            onUpdate={updateCoach}
            onDelete={deleteCoach}
          />
        )}

        {view === "followupsLog" && (
          <FollowupsLogView data={data} onRemoveFollowup={removeFollowup} />
        )}

        {view === "matchPlans" && <KampplanView data={activeData} />}

        {view === "kampScore" && <PlayerStatsView players={activeData.players} config={activeData.config} />}

        {view === "statistik" && <PlayerStatsView withFilters players={activeData.players} config={activeData.config} />}

        {view === "positionOverview" && <PositionOverviewView data={activeData} />}

        {view === "teams" && (
          <TeamsView
            teams={data.teams}
            players={activeData.players}
            onCreate={createTeam}
            onRename={renameTeam}
            onDelete={deleteTeam}
          />
        )}

        {view === "periods" && (
          <PeriodsView
            periods={periods}
            onCreate={createPeriod}
            onRename={renamePeriod}
            onDelete={deletePeriod}
          />
        )}

        {view === "roster" && (
          <RosterView
            data={data}
            periods={periods}
            onOpen={(id) => {
              scrollPositionsRef.current.roster = window.scrollY;
              pendingScrollRestoreRef.current = 0;
              setPlayerOriginView("roster");
              setSelectedId(id);
              setView("player");
            }}
            addingPlayer={addingPlayer}
            setAddingPlayer={setAddingPlayer}
            newName={newName}
            setNewName={setNewName}
            newPrimaryPosition={newPrimaryPosition}
            setNewPrimaryPosition={setNewPrimaryPosition}
            newSecondaryPosition={newSecondaryPosition}
            setNewSecondaryPosition={setNewSecondaryPosition}
            newNumber={newNumber}
            setNewNumber={setNewNumber}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            newTeamId={newTeamId}
            setNewTeamId={setNewTeamId}
            newSkillGroupId={newSkillGroupId}
            setNewSkillGroupId={setNewSkillGroupId}
            onAdd={addPlayer}
          />
        )}

        {view === "player" && selectedPlayer && (
          <PlayerView
            player={selectedPlayer}
            config={data.config}
            periods={periods}
            teams={data.teams}
            evaluations={data.evaluations[selectedPlayer.id] || {}}
            goals={data.goals[selectedPlayer.id] || {}}
            developmentPlan={(data.developmentPlans || {})[selectedPlayer.id] || null}
            onSaveDevelopmentPlan={(plan) => saveDevelopmentPlan(selectedPlayer.id, plan)}
            onBack={() => {
              pendingScrollRestoreRef.current = scrollPositionsRef.current[playerOriginView] || 0;
              setView(playerOriginView);
              setSelectedId(null);
            }}
            backLabel={playerOriginView === "coaches" ? "Træneroverblik" : "Spillertrup"}
            onScore={(periodId, subskillId, value) =>
              setScore(selectedPlayer.id, periodId, subskillId, value)
            }
            onDelete={() => setConfirmDelete(selectedPlayer.id)}
            onSetActive={(active) => updatePlayerActive(selectedPlayer.id, active)}
            onUpdatePositions={(patch) => updatePlayerPositions(selectedPlayer.id, patch)}
            onUpdateTeam={(teamId) => updatePlayerTeam(selectedPlayer.id, teamId)}
            onUpdateEmail={(email) => updatePlayerEmail(selectedPlayer.id, email)}
            onUpdateNumber={(number) => updatePlayerNumber(selectedPlayer.id, number)}
            onSetGoal={(periodId, subskillId, target, note, focusAreas) =>
              setGoal(selectedPlayer.id, periodId, subskillId, target, note, focusAreas)
            }
            onSetGoalProgress={(periodId, subskillId, progress) =>
              setGoalProgress(selectedPlayer.id, periodId, subskillId, progress)
            }
            onRemoveGoal={(periodId, subskillId) => removeGoal(selectedPlayer.id, periodId, subskillId)}
            onSetSkillGroup={(groupId) => updatePlayerSkillGroup(selectedPlayer.id, groupId)}
            onUpdateParticipationLevel={(levelId) =>
              updatePlayerParticipationLevel(selectedPlayer.id, levelId)
            }
            onUpdateGoalHorizons={(patch) => updatePlayerGoalHorizons(selectedPlayer.id, patch)}
            onGoToPeriods={() => setView("periods")}
          />
        )}
      </main>

      {confirmDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalTitle}>Fjern spiller?</div>
            <div style={styles.modalBody}>
              Dette sletter alle registrerede evalueringer for spilleren. Kan ikke fortrydes.
            </div>
            <div style={styles.modalActions}>
              <button style={styles.ghostBtn} onClick={() => setConfirmDelete(null)}>
                Annuller
              </button>
              <button style={styles.dangerBtn} onClick={() => deletePlayer(confirmDelete)}>
                Fjern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Player self-evaluation (accessed only via a private link) ---------- */
function PlayerSelfEvalApp({ player, config, periods, coachEvaluations, goals, developmentPlan, onSubmitSelfEval }) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(
    periods.length ? periods[periods.length - 1].id : null
  );
  const [drilldownCat, setDrilldownCat] = useState(null);
  const [printPanelOpen, setPrintPanelOpen] = useState(false);
  const [printColBMode, setPrintColBMode] = useState("goal");
  const [printColBPeriodId, setPrintColBPeriodId] = useState(null);
  const [planExpanded, setPlanExpanded] = useState(false);
  // Self-evaluation drafts, per period: { [periodId]: { [skillId]: 1-10 } }.
  // Nothing is sent until Gem, and Gem needs a value for every goal in the
  // period. status is "dirty" (changed since last save) or "saved" per period.
  const [drafts, setDrafts] = useState({});
  const [draftStatus, setDraftStatus] = useState({});
  const [selfSaving, setSelfSaving] = useState(false);
  const [selfSaveFailed, setSelfSaveFailed] = useState(false);

  useEffect(() => {
    if (!selectedPeriodId && periods.length) {
      setSelectedPeriodId(periods[periods.length - 1].id);
    }
  }, [periods.length, selectedPeriodId]);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) || null;
  const scores = selectedPeriod ? coachEvaluations[selectedPeriod.id]?.scores || {} : {};
  const periodGoals = (selectedPeriod && goals[selectedPeriod.id]) || {};

  const radarData = CATEGORY_META.map((c) => ({
    subject: c.short,
    value: categoryAverage(config, scores, c.key, player) || 0,
    goal: categoryGoalAverage(config, periodGoals, c.key, player) || 0,
  }));

  const periodId = selectedPeriod ? selectedPeriod.id : null;
  const periodDraft = (periodId && drafts[periodId]) || {};
  const periodStatus = periodId ? draftStatus[periodId] : undefined;
  const lastSelfEval = (goal) => {
    const log = goal.progressLog || []; // oldest first
    return log[log.length - 1] || null;
  };
  const setDraftValue = (skillId, v) => {
    if (!periodId) return;
    setDrafts((d) => ({ ...d, [periodId]: { ...(d[periodId] || {}), [skillId]: v } }));
    setDraftStatus((st) => ({ ...st, [periodId]: "dirty" }));
    setSelfSaveFailed(false);
  };
  const hasGoals = Object.keys(periodGoals).length > 0;
  const goalEntries = Object.keys(periodGoals)
    .map((skillId) => {
      const meta = findSkillMeta(config, skillId);
      if (!meta) return null;
      return { skillId, goal: periodGoals[skillId], ...meta };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.category.label.localeCompare(b.category.label) || a.skill.name.localeCompare(b.skill.name)
    );

  const ratedCount = goalEntries.filter((e) => typeof periodDraft[e.skillId] === "number").length;
  const allRated = goalEntries.length > 0 && ratedCount === goalEntries.length;
  const canSaveSelfEval = allRated && periodStatus === "dirty" && !selfSaving;
  const saveSelfEval = async () => {
    if (!canSaveSelfEval || !periodId) return;
    setSelfSaving(true);
    setSelfSaveFailed(false);
    const values = {};
    goalEntries.forEach((e) => {
      values[e.skillId] = periodDraft[e.skillId];
    });
    const ok = await onSubmitSelfEval(periodId, values);
    setSelfSaving(false);
    if (ok === false) setSelfSaveFailed(true);
    else setDraftStatus((st) => ({ ...st, [periodId]: "saved" }));
  };

  return (
    <div style={styles.app}>
      <PrintStyles />
      <div style={styles.headerTopBar}>
        <div style={styles.headerTopRow}>
          <div style={styles.brand}>
            <span style={styles.brandText}>VB PIGE AKADEMI</span>
            <span style={styles.brandSub}>Min udvikling</span>
          </div>
          <img src={LOGO_SRC} alt="Klublogo" style={styles.logoImg} />
        </div>
      </div>
      <div style={styles.headerStripes} />

      <main style={styles.main}>
        <div style={styles.playerHeadRow}>
          <div style={styles.numberBadgeLg}>{player.number || "—"}</div>
          <div>
            <h1 style={styles.h1}>{player.name}</h1>
            <p style={styles.subtext}>{formatPlayerPositions(player) || "Position ikke angivet"}</p>
          </div>
        </div>

        <div style={styles.infoBanner}>
          Her kan du se din træners vurdering og opdatere din egen indsats på dine udviklingsmål.
          Du kan ikke ændre selve scoren — det gør din træner.
        </div>

        {hasGoals && (
          <div style={styles.goalsOverviewCard}>
            <div style={styles.goalsOverviewHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={16} color="#1A1A1A" />
                <span style={styles.categoryLabel}>Dine udviklingsmål</span>
              </div>
            </div>
            {goalEntries.map(({ skillId, goal, skill, category }) => {
              const currentVal = scores[skillId];
              const achieved = typeof currentVal === "number" && currentVal >= goal.target;
              return (
                <div key={skillId} style={styles.goalOverviewRow}>
                  <div style={styles.goalOverviewTop}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ ...styles.dot, background: category.accent }} />
                        <span style={styles.skillName}>{skill.name}</span>
                        <span style={styles.goalOverviewCat}>{category.label}</span>
                      </div>
                      {(goal.note || goal.focusAreas) && (
                        <div style={styles.goalNote}>
                          {goal.note && (
                            <div>
                              <strong>Målsætning:</strong> {goal.note}
                            </div>
                          )}
                          {goal.focusAreas && (
                            <div>
                              <strong>Fokusområder:</strong> {goal.focusAreas}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        ...styles.goalChip,
                        ...(achieved ? styles.goalChipMet : styles.goalChipPending),
                      }}
                    >
                      <Target size={11} /> Mål {goal.target}
                      {achieved ? " ✓" : ""}
                    </span>
                  </div>
                  <ProgressTracker
                    value={typeof periodDraft[skillId] === "number" ? periodDraft[skillId] : null}
                    onChange={(v) => setDraftValue(skillId, v)}
                  />
                  {lastSelfEval(goal) && (
                    <div style={{ ...styles.subtext, fontSize: 12, marginTop: 4 }}>
                      Sidst gemt: {lastSelfEval(goal).progress}/10 ·{" "}
                      {formatDate(String(lastSelfEval(goal).createdAt).slice(0, 10))}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <button
                style={{ ...styles.primaryBtn, opacity: canSaveSelfEval ? 1 : 0.45, cursor: canSaveSelfEval ? "pointer" : "default" }}
                disabled={!canSaveSelfEval}
                onClick={saveSelfEval}
              >
                {selfSaving ? "Gemmer…" : "Gem"}
              </button>
              {selfSaveFailed ? (
                <span style={{ ...styles.subtext, color: "#B3261E" }}>Kunne ikke gemme — prøv igen.</span>
              ) : periodStatus === "saved" ? (
                <span style={{ ...styles.subtext, color: "#4D7B4D" }}>Gemt.</span>
              ) : !allRated ? (
                <span style={styles.subtext}>
                  Du skal vurdere alle {goalEntries.length} mål, før du kan gemme ({ratedCount} af {goalEntries.length}{" "}
                  vurderet).
                </span>
              ) : (
                <span style={styles.subtext}>Klar — tryk Gem for at sende din vurdering.</span>
              )}
            </div>
          </div>
        )}

        {!hasGoals && (
          <div style={styles.emptyState}>
            <Target size={28} color="#B9B2A0" />
            <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen udviklingsmål endnu</div>
            <div style={{ color: "#6B6B6B", fontSize: 14 }}>
              Din træner har ikke sat nogen mål for dig endnu.
            </div>
          </div>
        )}

        {hasDevelopmentPlanContent(developmentPlan) && (
          <div style={styles.goalsOverviewCard}>
            <div style={styles.goalsOverviewHead}>
              <button
                type="button"
                style={styles.collapseHeaderBtn}
                onClick={() => setPlanExpanded((v) => !v)}
              >
                {planExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <ClipboardList size={16} color="#1A1A1A" />
                <span style={styles.categoryLabel}>Din udviklingsplan</span>
                {developmentPlan.seasonLabel && (
                  <span style={styles.goalOverviewCat}>{developmentPlan.seasonLabel}</span>
                )}
              </button>
              <button
                style={styles.linkBtn}
                onClick={() => printDevelopmentPlan(player, developmentPlan)}
              >
                <Printer size={12} /> Print
              </button>
            </div>
            {planExpanded && (
              <div
                className="rp-content"
                dangerouslySetInnerHTML={{ __html: developmentPlan.contentHtml }}
              />
            )}
          </div>
        )}

        {periods.length > 0 && (
          <>
            <div style={styles.evalBar}>
              <div style={styles.evalTabs}>
                {periods.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPeriodId(p.id);
                      setDrilldownCat(null);
                    }}
                    style={{
                      ...styles.evalTab,
                      ...(selectedPeriodId === p.id ? styles.evalTabActive : {}),
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{p.label}</div>
                    <div style={styles.evalTabDate}>{formatDate(p.date)}</div>
                  </button>
                ))}
              </div>
              <button
                style={{
                  ...styles.compareBtn,
                  ...(printPanelOpen ? styles.compareBtnActive : {}),
                }}
                onClick={() => setPrintPanelOpen((v) => !v)}
              >
                <Printer size={14} /> Udskriv rapport
              </button>
            </div>

            {printPanelOpen && (
              <div style={styles.addCardCol}>
                <div style={styles.fieldLabel}>Anden kolonne skal vise</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    style={{
                      ...styles.teamFilterChip,
                      ...(printColBMode === "goal" ? styles.teamFilterChipActive : {}),
                    }}
                    onClick={() => setPrintColBMode("goal")}
                  >
                    Mål
                  </button>
                  <button
                    style={{
                      ...styles.teamFilterChip,
                      ...(printColBMode === "period" ? styles.teamFilterChipActive : {}),
                    }}
                    onClick={() => {
                      setPrintColBMode("period");
                      if (!printColBPeriodId) {
                        const alt = periods.find((p) => p.id !== selectedPeriodId);
                        setPrintColBPeriodId(alt ? alt.id : periods[0].id);
                      }
                    }}
                  >
                    Anden periode
                  </button>
                </div>
                {printColBMode === "period" && periods.length >= 2 && (
                  <div>
                    <div style={styles.fieldLabel}>Vælg periode til sammenligning</div>
                    <select
                      style={styles.select}
                      value={printColBPeriodId || ""}
                      onChange={(e) => setPrintColBPeriodId(e.target.value)}
                    >
                      {periods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label} · {formatDate(p.date)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button style={styles.primaryBtn} onClick={() => window.print()}>
                  <Printer size={16} /> Udskriv nu
                </button>
              </div>
            )}

            {selectedPeriod &&
              createPortal(
                <>
                  <CoverPagePrint player={player} config={config} />
                  <PrintableReport
                    player={player}
                    config={config}
                    goals={periodGoals}
                    colA={{
                      label: `${selectedPeriod.label} (${formatDate(selectedPeriod.date)})`,
                      scores,
                    }}
                    colB={
                      printColBMode === "goal"
                        ? {
                            label: "Mål",
                            scores: Object.fromEntries(
                              Object.keys(periodGoals).map((id) => [id, periodGoals[id].target])
                            ),
                          }
                        : {
                            label: (() => {
                              const p = periods.find((pp) => pp.id === printColBPeriodId);
                              return p ? `${p.label} (${formatDate(p.date)})` : "Anden periode";
                            })(),
                            scores: printColBPeriodId
                              ? coachEvaluations[printColBPeriodId]?.scores || {}
                              : {},
                          }
                    }
                  />
                  {hasDevelopmentPlanContent(developmentPlan) && (
                    <DevelopmentPlanPrintSection player={player} plan={developmentPlan} />
                  )}
                </>,
                document.body
              )}

            {selectedPeriod && (
              <>
                <div style={styles.radarCard}>
                  <p style={styles.radarHint}>Tryk på en kategori for at se de enkelte kriterier</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData} outerRadius="65%">
                      <PolarGrid stroke="#D9D4C7" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={(props) => (
                          <CategoryAxisTick {...props} onSelect={setDrilldownCat} />
                        )}
                      />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar
                        name="Trænervurdering"
                        dataKey="value"
                        stroke="#E2231A"
                        fill="#E2231A"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                      {hasGoals && (
                        <Radar
                          name="Mål"
                          dataKey="goal"
                          stroke={GOAL_COLOR}
                          fill="transparent"
                          strokeWidth={2}
                          strokeDasharray="5 4"
                          isAnimationActive={false}
                        />
                      )}
                      <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {drilldownCat && (
                  <SkillDrilldownRadar
                    config={config}
                    catKey={drilldownCat}
                    player={player}
                    scores={scores}
                    goals={periodGoals}
                    onClose={() => setDrilldownCat(null)}
                  />
                )}

                <div style={styles.evalMetaRow}>
                  <span style={styles.subtext}>
                    Viser <strong>{selectedPeriod.label}</strong> · {formatDate(selectedPeriod.date)}
                    {" · "}
                    <Lock size={11} style={{ verticalAlign: "-1px" }} /> Kun din træner kan ændre
                    scoren
                  </span>
                </div>

                {CATEGORY_META.map((cat) => {
                  const skills = categorySkillsForPlayer(config, player, cat.key);
                  const avg = categoryAverage(config, scores, cat.key, player);
                  return (
                    <div key={cat.key} style={styles.categoryBlock}>
                      <div style={styles.categoryHeadRow}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ ...styles.dot, background: cat.accent }} />
                          <span style={styles.categoryLabel}>{cat.label}</span>
                        </div>
                        <span style={{ ...styles.categoryAvg, color: cat.accent }}>
                          {avg ? avg.toFixed(1) : "—"}
                        </span>
                      </div>
                      {skills.length === 0 ? (
                        <div style={styles.noSkills}>Ingen aktive kriterier i denne kategori.</div>
                      ) : (
                        skills.map((skill) => {
                          const val = scores[skill.id];
                          return (
                            <div key={skill.id} style={styles.skillRow}>
                              <span style={styles.skillName}>{skill.name}</span>
                              <span
                                style={{
                                  ...styles.readOnlyScorePill,
                                  background: scoreColor(val),
                                }}
                              >
                                {val ?? "—"}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ---------- Player self-evaluation link card (shown to coaches on the player profile) ---------- */
function SelfEvalLinkCard({ token }) {
  const [copied, setCopied] = useState(false);

  const link = (() => {
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      return `${url.toString()}${url.toString().includes("?") ? "&" : "?"}player=${token}`;
    } catch (e) {
      return `?player=${token}`;
    }
  })();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* clipboard not available */
    }
  };

  return (
    <div style={styles.linkCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Link2 size={15} color="#1A1A1A" />
        <span style={styles.categoryLabel}>Spillerens selvevalueringslink</span>
      </div>
      <p style={styles.subtext}>
        Del dette link med spilleren. Alle med linket kan kun evaluere denne ene spiller — ingen
        andre spillere eller trænerfunktioner er tilgængelige.
      </p>
      <div style={styles.linkRow}>
        <input style={styles.linkInput} value={link} readOnly onFocus={(e) => e.target.select()} />
        <button style={styles.primaryBtnSm} onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Kopieret" : "Kopiér"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Kampplan share link card (shown to coaches in the kampplan editor) ---------- */
// Mints the token on first click (see POST /api/match-plans/:id/share) and
// shows the resulting link afterward — same shape as SelfEvalLinkCard, but
// the token has to be generated on demand rather than existing from the
// moment the plan was created, so there's a third "not generated yet"
// state this one has and SelfEvalLinkCard doesn't.
function KpShareLinkCard({ plan, onGenerated }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);

  if (!plan.id) {
    return (
      <div style={styles.linkCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Link2 size={15} color="#1A1A1A" />
          <span style={styles.categoryLabel}>Spillerlink</span>
        </div>
        <p style={styles.subtext}>Gem kampplanen først — så kan du generere et link til spillerne.</p>
      </div>
    );
  }

  if (!plan.shareToken) {
    const generate = async () => {
      setGenerating(true);
      setError(false);
      try {
        const { shareToken } = await api.generateMatchPlanShareLink(plan.id);
        onGenerated(shareToken);
      } catch (e) {
        setError(true);
      } finally {
        setGenerating(false);
      }
    };
    return (
      <div style={styles.linkCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Link2 size={15} color="#1A1A1A" />
          <span style={styles.categoryLabel}>Spillerlink</span>
        </div>
        <p style={styles.subtext}>
          Generér et link spillerne selv kan åbne — uden login. Det viser deres individuelle mål,
          startopstilling, målsætning og det taktiske. Linket er aktivt til og med dagen efter
          kampen.
        </p>
        {error && <div style={styles.errorBannerRow}>Kunne ikke generere link — prøv igen.</div>}
        <button style={styles.primaryBtnSm} onClick={generate} disabled={generating}>
          <Link2 size={14} /> {generating ? "Genererer…" : "Generér spillerlink"}
        </button>
      </div>
    );
  }

  const link = (() => {
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      return `${url.toString()}${url.toString().includes("?") ? "&" : "?"}kampplan=${plan.shareToken}`;
    } catch (e) {
      return `?kampplan=${plan.shareToken}`;
    }
  })();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* clipboard not available */
    }
  };

  return (
    <div style={styles.linkCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Link2 size={15} color="#1A1A1A" />
        <span style={styles.categoryLabel}>Spillerlink</span>
      </div>
      <p style={styles.subtext}>
        Del dette link med spillerne — uden login viser det deres individuelle mål, startopstilling,
        målsætning og det taktiske. Aktivt til og med {kpFmtDate(kpAddDays(plan.date, 1))}.
      </p>
      <div style={styles.linkRow}>
        <input style={styles.linkInput} value={link} readOnly onFocus={(e) => e.target.select()} />
        <button style={styles.primaryBtnSm} onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Kopieret" : "Kopiér"}
        </button>
      </div>
    </div>
  );
}

const GOAL_HORIZON_FIELDS = [
  { key: "goal2to3y", label: "Mål (2-3 år)" },
  { key: "goal1to2y", label: "Mål (1-2 år)" },
  { key: "goalUnder1y", label: "Mål (under 1 år)" },
];

function LongTermGoalsCard({ player, onSave }) {
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState({});

  const startEdit = () => {
    setDrafts({
      goal2to3y: player.goal2to3y || "",
      goal1to2y: player.goal1to2y || "",
      goalUnder1y: player.goalUnder1y || "",
    });
    setEditing(true);
  };

  const save = () => {
    onSave({
      goal2to3y: drafts.goal2to3y.trim(),
      goal1to2y: drafts.goal1to2y.trim(),
      goalUnder1y: drafts.goalUnder1y.trim(),
    });
    setEditing(false);
  };

  const hasAny = GOAL_HORIZON_FIELDS.some((f) => player[f.key]);

  return (
    <div style={styles.categoryBlock}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={15} color="#1A1A1A" />
          <span style={styles.categoryLabel}>Langsigtede udviklingsmål</span>
        </div>
        {!editing && (
          <button style={styles.linkBtn} onClick={startEdit}>
            <Pencil size={12} /> Rediger
          </button>
        )}
      </div>

      {!editing && !hasAny && (
        <p style={styles.subtext}>Ingen langsigtede mål angivet endnu.</p>
      )}

      {!editing &&
        hasAny &&
        GOAL_HORIZON_FIELDS.filter((f) => player[f.key]).map((f) => (
          <div key={f.key} style={{ marginBottom: 8 }}>
            <div style={styles.fieldLabel}>{f.label}</div>
            <p style={{ margin: 0, fontSize: 14 }}>{player[f.key]}</p>
          </div>
        ))}

      {editing && (
        <div>
          {GOAL_HORIZON_FIELDS.map((f) => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <div style={styles.fieldLabel}>{f.label}</div>
              <textarea
                style={{ ...styles.textarea, minHeight: 48 }}
                value={drafts[f.key]}
                onChange={(e) => setDrafts({ ...drafts, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtnSm} onClick={save}>
              Gem
            </button>
            <button style={styles.ghostBtn} onClick={() => setEditing(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_DEVELOPMENT_PLAN = { seasonLabel: "", contentHtml: "" };

// True once there's any actual text — used to hide the plan section from
// both print flows (and the standalone print/read views) for a player
// nobody has written a plan for yet, rather than printing an empty shell.
// A contentEditable div with no real content can still hold markup like
// "<p><br></p>", so this strips tags rather than just checking for "".
function hasDevelopmentPlanContent(plan) {
  if (!plan) return false;
  return Boolean((plan.contentHtml || "").replace(/<[^>]*>/g, "").trim());
}

// Minimal rich-text box: a contentEditable div plus a small formatting
// toolbar. Built rather than pulled in as a library because the actual
// need is narrow — the coach pastes a plan drafted elsewhere (Word, Docs)
// and its formatting should survive, not a full authoring tool — and the
// browser already does the hard part of turning a paste into bold/lists/
// headings markup. execCommand is deprecated but has no replacement for
// this yet and every major browser still ships it; contentEditable is
// left uncontrolled (not resynced from the `value` prop after mount) since
// React re-rendering the DOM under an active selection would jump the
// cursor around the whole point of typing here.
function RichTextEditor({ value, onChange }) {
  const ref = React.useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // Intentionally only runs once on mount — see note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (command) => {
    ref.current?.focus();
    document.execCommand(command);
    onChange(ref.current?.innerHTML || "");
  };

  return (
    <div>
      <div style={styles.rtToolbar}>
        <button type="button" style={styles.rtBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")} title="Fed">
          <b>F</b>
        </button>
        <button type="button" style={styles.rtBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")} title="Kursiv">
          <i>K</i>
        </button>
        <button type="button" style={styles.rtBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")} title="Punktopstilling">
          <List size={14} />
        </button>
        <button type="button" style={styles.rtBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")} title="Nummereret liste">
          <ListOrdered size={14} />
        </button>
        <button type="button" style={styles.rtBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")} title="Ryd formatering">
          Ryd
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="rp-content"
        style={styles.rtEditable}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}

// The one running udviklingsplan for a player — a single rich-text document
// the coach drafts (or pastes in) covering intro, kampsti, egentræning,
// tracked stats and opfølgning in whatever structure they choose. Per-skill
// targets stay in the existing goals table and are pulled in separately
// when this prints, not duplicated here. See hasDevelopmentPlanContent for
// why print/read views can safely no-op when nothing has been written yet.
function DevelopmentPlanCard({ player, plan, onSave }) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DEVELOPMENT_PLAN);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  // RichTextEditor only syncs its contentEditable DOM from `value` once, on
  // mount (see its own comment — re-syncing on every prop change would fight
  // the cursor while typing/pasting). A Claude draft arrives well after
  // mount, so bumping this key forces a fresh mount to actually show it.
  const [editorKey, setEditorKey] = useState(0);
  const current = plan || EMPTY_DEVELOPMENT_PLAN;
  const hasContent = hasDevelopmentPlanContent(current);

  const startEdit = () => {
    setDraft({ seasonLabel: current.seasonLabel || "", contentHtml: current.contentHtml || "" });
    setGenError("");
    setEditorKey((k) => k + 1);
    setEditing(true);
  };

  const save = () => {
    onSave({ seasonLabel: draft.seasonLabel.trim(), contentHtml: draft.contentHtml });
    setEditing(false);
    setExpanded(true);
  };

  // Drafts into the editor for review — never saved automatically, so a
  // bad or unwanted draft costs nothing to discard (just don't hit Gem).
  const generate = async () => {
    if (hasDevelopmentPlanContent({ contentHtml: draft.contentHtml })) {
      if (!window.confirm("Dette erstatter teksten i feltet med et Claude-udkast. Fortsæt?")) return;
    }
    setGenError("");
    setGenerating(true);
    try {
      const { contentHtml } = await api.generateDevelopmentPlan(player.id);
      setDraft((d) => ({ ...d, contentHtml }));
      setEditorKey((k) => k + 1);
    } catch (e) {
      setGenError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={styles.categoryBlock}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        {hasContent && !editing ? (
          <button type="button" style={styles.collapseHeaderBtn} onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <ClipboardList size={15} color="#1A1A1A" />
            <span style={styles.categoryLabel}>Udviklingsplan</span>
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClipboardList size={15} color="#1A1A1A" />
            <span style={styles.categoryLabel}>Udviklingsplan</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {!editing && hasContent && (
            <button style={styles.linkBtn} onClick={() => printDevelopmentPlan(player, current)}>
              <Printer size={12} /> Print udviklingsplan
            </button>
          )}
          {!editing && (
            <button style={styles.linkBtn} onClick={startEdit}>
              <Pencil size={12} /> {hasContent ? "Rediger" : "Opret"}
            </button>
          )}
        </div>
      </div>

      {!editing && !hasContent && (
        <p style={styles.subtext}>Ingen udviklingsplan skrevet endnu.</p>
      )}

      {!editing && hasContent && expanded && (
        <div>
          {current.seasonLabel && (
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{current.seasonLabel}</div>
          )}
          <div className="rp-content" dangerouslySetInnerHTML={{ __html: current.contentHtml }} />
        </div>
      )}

      {editing && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <div style={styles.fieldLabel}>Sæson</div>
            <input
              style={styles.input}
              value={draft.seasonLabel}
              placeholder="fx Efterår 2026 – sommer 2027"
              onChange={(e) => setDraft({ ...draft, seasonLabel: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={styles.fieldLabel}>Plan — indsæt eller skriv frit</div>
              <button style={styles.linkBtn} onClick={generate} disabled={generating}>
                <Sparkles size={12} /> {generating ? "Genererer…" : "Generér med Claude"}
              </button>
            </div>
            {genError && <div style={styles.errorBannerRow}>{genError}</div>}
            <RichTextEditor
              key={editorKey}
              value={draft.contentHtml}
              onChange={(contentHtml) => setDraft((d) => ({ ...d, contentHtml }))}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtnSm} onClick={save}>
              Gem
            </button>
            <button style={styles.ghostBtn} onClick={() => setEditing(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PeriodsView({ periods, onCreate, onRename, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [date, setDate] = useState(todayStr());
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDate, setEditDate] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const startCreate = () => {
    setLabel("");
    setDate(todayStr());
    setCreating(true);
  };

  const submitCreate = async () => {
    if (!label.trim()) return;
    await onCreate(label.trim(), date);
    setCreating(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditLabel(p.label);
    setEditDate(p.date);
  };

  const submitEdit = async () => {
    if (!editLabel.trim()) return;
    await onRename(editingId, editLabel.trim(), editDate);
    setEditingId(null);
  };

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Evalueringsperioder</h1>
          <p style={styles.subtext}>
            Oprettes én gang og deles af alle spillere — fx "Forsæson" og "Midtsæson". Alle
            trænere vurderer hver spiller ud fra de samme perioder.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={startCreate}>
          <Plus size={16} /> Ny periode
        </button>
      </div>

      {creating && (
        <div style={styles.addCardCol}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={styles.input}
              placeholder="Periodenavn (fx Forsæson)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
            <input
              type="date"
              style={{ ...styles.input, maxWidth: 170 }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtn} onClick={submitCreate}>
              Opret
            </button>
            <button style={styles.ghostBtn} onClick={() => setCreating(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {periods.length === 0 && !creating && (
        <div style={styles.emptyState}>
          <CalendarRange size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen evalueringsperioder endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Opret én (fx "Forsæson"), så trænere kan begynde at vurdere spillere ud fra den.
          </div>
        </div>
      )}

      {periods.map((p) => (
        <div key={p.id} style={styles.periodRow}>
          {editingId === p.id ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
              <input
                style={styles.input}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                autoFocus
              />
              <input
                type="date"
                style={{ ...styles.input, maxWidth: 170 }}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
              <button style={styles.primaryBtnSm} onClick={submitEdit}>
                Gem
              </button>
              <button style={styles.ghostBtn} onClick={() => setEditingId(null)}>
                Annuller
              </button>
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontWeight: 700 }}>{p.label}</div>
                <div style={styles.subtext}>{formatDate(p.date)}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={styles.iconBtn} onClick={() => startEdit(p)} title="Rediger">
                  <Pencil size={14} />
                </button>
                <button
                  style={{ ...styles.iconBtn, color: "#E2231A" }}
                  onClick={() => setConfirmDeleteId(p.id)}
                  title="Slet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {confirmDeleteId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalTitle}>Slet denne periode?</div>
            <div style={styles.modalBody}>
              Dette fjerner den for alle spillere, inklusive allerede indtastede scores på tværs
              af hele truppen. Kan ikke fortrydes.
            </div>
            <div style={styles.modalActions}>
              <button style={styles.ghostBtn} onClick={() => setConfirmDeleteId(null)}>
                Annuller
              </button>
              <button
                style={styles.dangerBtn}
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Slet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipationLevelsView({ levels, onCreate, onUpdate, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [numericValue, setNumericValue] = useState(0);
  const [editingName, setEditingName] = useState(null);

  const sortedLevels = [...levels].sort((a, b) => a.sortOrder - b.sortOrder);

  const submitCreate = async () => {
    if (!name.trim()) return;
    await onCreate(name.trim(), Number(numericValue) || 0);
    setName("");
    setNumericValue(0);
    setCreating(false);
  };

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Deltagelsesniveauer</h1>
          <p style={styles.subtext}>
            Definér hvilke niveauer spillere kan deltage i udviklingsprogrammet på. Den numeriske
            værdi bruges til at sortere spillere efter niveau. Forventninger vises på spillerens
            rapport.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setCreating(true)}>
          <Plus size={16} /> Nyt niveau
        </button>
      </div>

      {creating && (
        <div style={styles.addCardCol}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={styles.input}
              placeholder="Niveaunavn (fx Udvidet)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <input
              type="number"
              style={{ ...styles.input, maxWidth: 100 }}
              placeholder="Værdi"
              value={numericValue}
              onChange={(e) => setNumericValue(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtn} onClick={submitCreate}>
              Opret
            </button>
            <button style={styles.ghostBtn} onClick={() => setCreating(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {sortedLevels.length === 0 && !creating && (
        <div style={styles.emptyState}>
          <BarChart3 size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen niveauer endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Opret ét (fx "Standard"), så spillere kan tildeles det.
          </div>
        </div>
      )}

      {sortedLevels.map((l) => (
        <div key={l.id} style={styles.categoryBlock}>
          <div style={styles.settingsRow}>
            {editingName === l.id ? (
              <div style={{ display: "flex", gap: 8, flex: 1 }}>
                <input
                  style={styles.editInput}
                  defaultValue={l.name}
                  autoFocus
                  onBlur={(e) => {
                    onUpdate(l.id, { name: e.target.value.trim() || l.name });
                    setEditingName(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.target.blur();
                    if (e.key === "Escape") setEditingName(null);
                  }}
                />
                <input
                  type="number"
                  style={{ ...styles.input, maxWidth: 90 }}
                  defaultValue={l.numericValue}
                  onBlur={(e) => onUpdate(l.id, { numericValue: Number(e.target.value) || 0 })}
                />
              </div>
            ) : (
              <div>
                <span style={{ fontWeight: 700 }}>{l.name}</span>
                <span style={styles.subtext}> · værdi {l.numericValue}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              <button style={styles.iconBtn} onClick={() => setEditingName(l.id)} title="Omdøb / rediger værdi">
                <Pencil size={14} />
              </button>
              <button
                style={{ ...styles.iconBtn, color: "#E2231A" }}
                onClick={() => onDelete(l.id)}
                title="Slet"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={styles.fieldLabel}>Forventninger (vises på rapporten)</div>
            <textarea
              style={styles.textarea}
              defaultValue={l.expectations}
              placeholder="Fx: Deltager i 2 træninger om ugen og forventes til alle kampe."
              onBlur={(e) => {
                if (e.target.value !== l.expectations) {
                  onUpdate(l.id, { expectations: e.target.value });
                }
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Self-contained (fetches/saves its own state) rather than threaded through
// the top-level bootstrap payload — it's one string, read only by the
// server-side "Generér med Claude" call, never needed anywhere else in the
// client, so plumbing it through App-wide state would be pure overhead.
function AiPromptView() {
  const [prompt, setPrompt] = useState(null); // null while loading
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        const value = s.development_plan_prompt || "";
        setPrompt(value);
        setDraft(value);
      })
      .catch((e) => setError(e.message));
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api.updateSetting("development_plan_prompt", draft);
      setPrompt(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>AI-udkast</h1>
          <p style={styles.subtext}>
            Den faste instruktion, som "Generér med Claude" (på udviklingsplan-kortet) sender
            sammen med spillerens rigtige evalueringer og mål. Claude ser kun disse to ting —
            aldrig andre spilleres data.
          </p>
        </div>
      </div>

      {error && <div style={styles.errorBannerRow}>{error}</div>}

      {prompt === null && !error ? (
        <p style={styles.subtext}>Indlæser…</p>
      ) : (
        <div style={styles.addCardCol}>
          <textarea
            style={{ ...styles.textarea, minHeight: 320, fontFamily: "inherit" }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={styles.primaryBtn} onClick={save} disabled={saving || draft === prompt}>
              {saving ? "Gemmer…" : "Gem"}
            </button>
            {draft !== prompt && !saving && <span style={styles.subtext}>Ikke gemt endnu</span>}
            {saved && <span style={{ ...styles.subtext, color: "#4D7B4D" }}>Gemt.</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// The 11 formation numbers themselves never change (server/positions.js),
// but which English stats-import abbreviations map to each one, and what
// characterises the position, are coach-editable here — used respectively
// by the stats-import mismatch check (matchStats.js) and the AI
// development-plan prompt (developmentPlans.js).
function PositionSettingsView() {
  const [positions, setPositions] = useState(null); // null while loading
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPositionSettings().then(setPositions).catch((e) => setError(e.message));
  }, []);

  const save = async (id, patch) => {
    const updated = await api.updatePositionSetting(id, patch);
    setPositions((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Positionsopsætning</h1>
          <p style={styles.subtext}>
            Kobl hver af de 11 positioner til de engelske positionsbetegnelser, statistik-
            importen kan bruge for den (fx "RM", "RW" for højre kant/midtbane) — det er det,
            der lader importen genkende og advare om en forkert position. Beskrivelsen bruges
            desuden som kendetegn for positionen i AI-genererede udviklingsplaner.
          </p>
        </div>
      </div>

      {error && <div style={styles.errorBannerRow}>{error}</div>}

      {positions === null && !error ? (
        <p style={styles.subtext}>Indlæser…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(positions || []).map((p) => (
            <PositionSettingRow key={p.id} position={p} onSave={save} />
          ))}
        </div>
      )}
    </div>
  );
}

function PositionSettingRow({ position, onSave }) {
  const [aliasesDraft, setAliasesDraft] = useState(position.aliases.join(", "));
  const [charDraft, setCharDraft] = useState(position.characteristics);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = aliasesDraft !== position.aliases.join(", ") || charDraft !== position.characteristics;

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const aliases = aliasesDraft
        .split(/[,\s]+/)
        .map((a) => a.trim())
        .filter(Boolean);
      await onSave(position.id, { aliases, characteristics: charDraft.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.positionEditCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={styles.numberBadge}>{position.id}</div>
        <strong>{position.label}</strong>
        <span style={styles.subtext}>({position.abbr})</span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={styles.fieldLabel}>Engelske positionsbetegnelser (adskilt med komma)</div>
        <input
          style={styles.input}
          value={aliasesDraft}
          onChange={(e) => setAliasesDraft(e.target.value)}
          placeholder="fx RM, RW"
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={styles.fieldLabel}>Kendetegn for positionen</div>
        <textarea
          style={{ ...styles.textarea, minHeight: 70, width: "100%", boxSizing: "border-box" }}
          value={charDraft}
          onChange={(e) => setCharDraft(e.target.value)}
        />
      </div>

      {error && <div style={styles.errorBannerRow}>{error}</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button style={styles.primaryBtnSm} onClick={save} disabled={saving || !dirty}>
          {saving ? "Gemmer…" : "Gem"}
        </button>
        {dirty && !saving && <span style={styles.subtext}>Ikke gemt endnu</span>}
        {saved && <span style={{ ...styles.subtext, color: "#4D7B4D" }}>Gemt.</span>}
      </div>
    </div>
  );
}

function ProgressTracker({ value, onChange, compact }) {
  return (
    <div style={styles.progressRow}>
      <span style={styles.progressLabel}>Fremskridt</span>
      <div style={styles.progressButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => {
          const filled = typeof value === "number" && v <= value;
          return (
            <button
              key={v}
              onClick={() => onChange(value === v ? null : v)}
              style={{
                ...(compact ? styles.progressBtnCompact : styles.progressBtn),
                background: filled ? "#1A1A1A" : "#FFFFFF",
                color: filled ? "#FFFFFF" : "#1A1A1A",
                borderColor: filled ? "#1A1A1A" : "#D9D4C7",
              }}
              title={`Sæt fremskridt til ${v}`}
            >
              {v}
            </button>
          );
        })}
      </div>
      <span style={styles.progressValue}>{typeof value === "number" ? `${value}/10` : "—"}</span>
    </div>
  );
}

// The player's own latest answer for a goal, shown under the coach's
// Fremskridt row — highlighted when the two are further apart than the
// Spillertrup warning allows (SELF_EVAL_GAP_LIMIT).
function LatestSelfEval({ goal }) {
  const log = goal.progressLog || [];
  const last = log[log.length - 1]; // oldest first
  const apart =
    last && typeof goal.progress === "number" && Math.abs(goal.progress - last.progress) > SELF_EVAL_GAP_LIMIT;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 6,
        fontSize: 12,
        color: apart ? "#7A4B00" : "#4A4A4A",
      }}
    >
      <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11, color: "#6B6B6B" }}>
        Spillerens egenvurdering
      </span>
      {last ? (
        <>
          <strong style={{ fontSize: 13 }}>{last.progress}/10</strong>
          <span style={{ color: "#6B6B6B" }}>{formatSelfEvalTime(last.createdAt)}</span>
          {apart && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <AlertTriangle size={12} /> Afviger fra din vurdering ({goal.progress}/10)
            </span>
          )}
        </>
      ) : (
        <span style={{ color: "#6B6B6B" }}>Ingen egenvurdering endnu</span>
      )}
    </div>
  );
}

function formatSelfEvalTime(createdAt) {
  const dt = new Date(createdAt);
  if (isNaN(dt.getTime())) return String(createdAt);
  return dt.toLocaleString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// One goal's self-evaluations over time. Points are evenly spaced in the
// order they were submitted (not to scale in time) so close-together dates
// stay readable, and each carries its date underneath and its value above;
// hovering/tapping a point also shows the exact time. `entries` is oldest first.
// `coachValue` (the goal's current progress, 0-10) is drawn as a red line
// across the chart for the coach's current assessment.
function SelfEvalChart({ entries, coachValue }) {
  const data = entries.map((e, i) => ({ i, progress: e.progress, createdAt: e.createdAt }));
  const shortDate = (i) => {
    const dt = new Date(entries[i] ? entries[i].createdAt : NaN);
    if (isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "2-digit" });
  };
  const hasCoach = typeof coachValue === "number";
  return (
    <div style={{ marginTop: 8 }}>
    <div style={{ width: "100%", height: 170 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#EEEBE3" vertical={false} />
          <XAxis
            dataKey="i"
            interval={0}
            padding={{ left: 18, right: 18 }}
            tickFormatter={shortDate}
            tick={{ fontSize: 11, fill: "#6B6B6B" }}
            tickLine={false}
            axisLine={{ stroke: "#D9D4C7" }}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 5, 10]}
            width={28}
            tick={{ fontSize: 11, fill: "#6B6B6B" }}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            isAnimationActive={false}
            cursor={{ stroke: "#D9D4C7" }}
            content={({ active, payload }) =>
              active && payload && payload.length ? (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #D9D4C7",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 12,
                  }}
                >
                  <div style={{ color: "#6B6B6B" }}>{formatSelfEvalTime(payload[0].payload.createdAt)}</div>
                  <div style={{ fontWeight: 700 }}>{payload[0].payload.progress}/10</div>
                </div>
              ) : null
            }
          />
          {hasCoach && <ReferenceLine y={coachValue} stroke="#E2231A" strokeWidth={2} ifOverflow="extendDomain" />}
          <Line
            type="linear"
            dataKey="progress"
            stroke="#1A1A1A"
            strokeWidth={2}
            dot={{ r: 4, fill: "#1A1A1A", stroke: "#FFFFFF", strokeWidth: 1.5 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
            label={{ position: "top", fontSize: 12, fontWeight: 700, fill: "#1A1A1A" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#4A4A4A", marginTop: 4 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 16, height: 2, background: "#1A1A1A", display: "inline-block" }} />
        Spillerens selvevaluering
      </span>
      {hasCoach && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 16, height: 2, background: "#E2231A", display: "inline-block" }} />
          Trænerens aktuelle vurdering ({coachValue}/10)
        </span>
      )}
    </div>
    </div>
  );
}

// Everything the player has answered through her self-evaluation link, per
// goal and per period (newest period and newest answer first). The log is
// append-only on the server (goal_progress_log), so this is the whole
// history, not just the latest value that GoalsOverview's tracker shows.
// goals.progress can also be set by a coach, which is not logged — so when
// the current value differs from the last answer it's shown separately
// rather than passed off as something the player said.
function SelfEvalHistory({ config, goals, periods }) {
  const [expanded, setExpanded] = useState(true);

  const sections = [...periods]
    .reverse()
    .map((period) => {
      const byPeriod = goals[period.id] || {};
      const items = Object.keys(byPeriod)
        .map((skillId) => ({ skillId, goal: byPeriod[skillId], meta: findSkillMeta(config, skillId) }))
        .filter((x) => x.meta);
      return { period, items };
    })
    .filter((sec) => sec.items.length > 0);

  const total = sections.reduce(
    (n, sec) => n + sec.items.reduce((m, it) => m + (it.goal.progressLog || []).length, 0),
    0
  );
  if (sections.length === 0) return null;

  return (
    <div style={styles.categoryBlock}>
      <div
        className="category-head-row-collapsible"
        style={styles.categoryHeadRow}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.iconBtnGhost}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Skjul" : "Vis"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span style={styles.categoryLabel}>Spillerens selvevalueringer</span>
        </div>
        <span style={styles.categoryAvg}>{total}</span>
      </div>
      {expanded && (
        <div>
          {total === 0 && (
            <p style={styles.noSkills}>Spilleren har ikke indsendt nogen selvevaluering endnu.</p>
          )}
          {sections.map(({ period, items }) => (
            <div key={period.id} style={{ marginTop: 14 }}>
              <div style={{ ...styles.fieldLabel, marginBottom: 8 }}>{period.label}</div>
              {items.map(({ skillId, goal, meta }) => {
                const log = [...(goal.progressLog || [])].reverse(); // newest first
                const last = log[0];
                const currentDiffers =
                  typeof goal.progress === "number" && (!last || last.progress !== goal.progress);
                return (
                  <div
                    key={skillId}
                    style={{ padding: "10px 0", borderTop: "1px solid #EEEBE3" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <div style={{ ...styles.dot, background: meta.category.accent }} />
                      <span style={styles.skillName}>{meta.skill.name}</span>
                      <span style={styles.goalOverviewCat}>Mål {goal.target}</span>
                    </div>
                    {goal.focusAreas && (
                      <div style={{ ...styles.goalNote, marginTop: 4 }}>
                        <strong>Fokusområder:</strong> {goal.focusAreas}
                      </div>
                    )}
                    {log.length === 0 ? (
                      <div style={{ ...styles.subtext, marginTop: 6 }}>
                        Ingen selvevaluering indsendt endnu.
                        {typeof goal.progress === "number" && (
                          <span style={{ color: "#E2231A", fontWeight: 600 }}>
                            {" "}
                            Trænerens aktuelle vurdering: {goal.progress}/10
                          </span>
                        )}
                      </div>
                    ) : (
                      <SelfEvalChart
                        entries={goal.progressLog}
                        coachValue={typeof goal.progress === "number" ? goal.progress : null}
                      />
                    )}
                    {currentDiffers && last && (
                      <div style={{ ...styles.subtext, marginTop: 4, fontSize: 12 }}>
                        Den røde linje afviger fra spillerens seneste selvevaluering ({last.progress}/10).
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getLatestFollowup(data, playerId) {
  const list = data.followups?.[playerId];
  if (!list || list.length === 0) return null;
  return list[list.length - 1];
}

function CoachesOverviewView({ data, onSetGoalProgress, onOpenPlayer, onAddFollowup, onRemoveFollowup }) {
  const periods = sortedPeriods(data.periods);
  const [selectedPeriodId, setSelectedPeriodId] = useState(
    periods.length ? periods[periods.length - 1].id : null
  );
  const [sortMode, setSortMode] = useState("alpha");
  const [followupPlayerId, setFollowupPlayerId] = useState(null);
  const [followupNote, setFollowupNote] = useState("");
  const [followupCoachId, setFollowupCoachId] = useState("");
  // Goals start collapsed per player — with every player's full goal list
  // (note/focus areas/progress buttons) expanded at once, this page got
  // very long very fast. The header still shows the count so a coach can
  // tell at a glance who has goals set without opening each one.
  const [expandedGoals, setExpandedGoals] = useState({});

  useEffect(() => {
    if (!selectedPeriodId && periods.length) {
      setSelectedPeriodId(periods[periods.length - 1].id);
    }
    if (selectedPeriodId && !periods.find((p) => p.id === selectedPeriodId)) {
      setSelectedPeriodId(periods.length ? periods[periods.length - 1].id : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods.length]);

  const openFollowupForm = (playerId) => {
    setFollowupPlayerId(playerId);
    setFollowupNote("");
    setFollowupCoachId("");
  };

  const saveFollowup = (playerId) => {
    onAddFollowup(playerId, followupCoachId || null, followupNote.trim());
    setFollowupPlayerId(null);
  };

  const levelById = {};
  (data.config.participationLevels || []).forEach((l) => {
    levelById[l.id] = l;
  });

  const sortedPlayers =
    sortMode === "followup"
      ? [...data.players].sort((a, b) => {
          const la = getLatestFollowup(data, a.id);
          const lb = getLatestFollowup(data, b.id);
          const ta = la ? new Date(la.createdAt).getTime() : -Infinity;
          const tb = lb ? new Date(lb.createdAt).getTime() : -Infinity;
          return ta - tb;
        })
      : sortMode === "level"
      ? [...data.players].sort((a, b) => {
          const va = levelById[a.participationLevelId]?.numericValue ?? -Infinity;
          const vb = levelById[b.participationLevelId]?.numericValue ?? -Infinity;
          return vb - va;
        })
      : data.players;

  return (
    <div>
      <style>{`
        .category-skills { display: none; }
        .category-skills.category-skills-open { display: block; }
        .category-head-row-collapsible { cursor: pointer; }
      `}</style>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Træneroverblik</h1>
          <p style={styles.subtext}>
            Alle spilleres udviklingsmål, målsætninger og opfølgninger samlet ét sted.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            style={{ ...styles.teamFilterChip, ...(sortMode === "followup" ? styles.teamFilterChipActive : {}) }}
            onClick={() => setSortMode((v) => (v === "followup" ? "alpha" : "followup"))}
          >
            <ArrowUpDown size={14} />{" "}
            {sortMode === "followup" ? "Sortér alfabetisk" : "Sortér efter seneste opfølgning"}
          </button>
          <button
            style={{ ...styles.teamFilterChip, ...(sortMode === "level" ? styles.teamFilterChipActive : {}) }}
            onClick={() => setSortMode((v) => (v === "level" ? "alpha" : "level"))}
          >
            <BarChart3 size={14} /> {sortMode === "level" ? "Sortér alfabetisk" : "Sortér efter niveau"}
          </button>
        </div>
      </div>

      {periods.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={styles.fieldLabel}>Evalueringsperiode</div>
          <select
            style={styles.select}
            value={selectedPeriodId || ""}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} · {formatDate(p.date)}
              </option>
            ))}
          </select>
        </div>
      )}

      {periods.length === 0 && (
        <div style={styles.emptyState}>
          <CalendarRange size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen evalueringsperioder endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Opret en periode under Perioder, så kan du vælge den her.
          </div>
        </div>
      )}

      {periods.length > 0 && data.players.length === 0 && (
        <div style={styles.emptyState}>
          <ClipboardList size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen spillere endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Tilføj spillere i Spillertrup, så vises de her.
          </div>
        </div>
      )}

      {periods.length > 0 && sortedPlayers.map((player) => {
        const goals = data.goals[player.id]?.[selectedPeriodId] || {};
        const goalIds = Object.keys(goals);
        const scores = selectedPeriodId ? getPlayerScores(data, player.id, selectedPeriodId) : {};
        const entries = goalIds
          .map((skillId) => {
            const meta = findSkillMeta(data.config, skillId);
            if (!meta) return null;
            return { skillId, goal: goals[skillId], ...meta };
          })
          .filter(Boolean)
          .sort(
            (a, b) =>
              a.category.label.localeCompare(b.category.label) ||
              a.skill.name.localeCompare(b.skill.name)
          );

        const latestFollowup = getLatestFollowup(data, player.id);
        const followupCoachName = latestFollowup?.coachId
          ? (data.coaches || []).find((c) => c.id === latestFollowup.coachId)?.name
          : null;
        const isRegistering = followupPlayerId === player.id;

        return (
          <div key={player.id} style={styles.coachPlayerCard}>
            <div style={styles.coachPlayerHead} onClick={() => onOpenPlayer(player.id)}>
              <div style={styles.numberBadge}>{player.number || "—"}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.playerName}>{player.name}</div>
                <div style={styles.subtext}>{formatPlayerPositions(player) || "Position ikke angivet"}</div>
                {levelById[player.participationLevelId] && (
                  <div style={styles.teamBadge}>
                    <BarChart3 size={10} /> {levelById[player.participationLevelId].name}
                  </div>
                )}
              </div>
              <ChevronRight size={18} color="#B9B2A0" />
            </div>

            <div style={styles.goalOverviewRow}>
              <div style={styles.goalOverviewTop}>
                <div>
                  <div style={styles.subtext}>
                    {latestFollowup
                      ? `Seneste opfølgning: ${formatDate(latestFollowup.createdAt.slice(0, 10))}${
                          followupCoachName ? ` · ${followupCoachName}` : ""
                        }`
                      : "Ingen opfølgning endnu"}
                  </div>
                  {latestFollowup && latestFollowup.note && (
                    <div style={styles.goalNote}>{latestFollowup.note}</div>
                  )}
                </div>
                {!isRegistering && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {latestFollowup && (
                      <button
                        style={styles.iconBtnGhost}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFollowup(player.id, latestFollowup.id);
                        }}
                        title="Fjern seneste opfølgning"
                      >
                        <X size={12} />
                      </button>
                    )}
                    <button
                      style={styles.linkBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openFollowupForm(player.id);
                      }}
                    >
                      <MessageSquarePlus size={12} /> Registrer opfølgning
                    </button>
                  </div>
                )}
              </div>

              {isRegistering && (
                <div style={styles.goalEditRow}>
                  <div style={styles.fieldLabel}>Note</div>
                  <input
                    style={styles.input}
                    placeholder="fx aftalt fokus til næste træning"
                    value={followupNote}
                    maxLength={500}
                    onChange={(e) => setFollowupNote(e.target.value)}
                    autoFocus
                  />
                  <div style={styles.charCount}>{followupNote.length}/500</div>
                  <div style={styles.fieldLabel}>Træner</div>
                  <select
                    style={styles.select}
                    value={followupCoachId}
                    onChange={(e) => setFollowupCoachId(e.target.value)}
                  >
                    <option value="">Ingen valgt</option>
                    {(data.coaches || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={styles.primaryBtnSm} onClick={() => saveFollowup(player.id)}>
                      Gem
                    </button>
                    <button style={styles.ghostBtn} onClick={() => setFollowupPlayerId(null)}>
                      Annuller
                    </button>
                  </div>
                </div>
              )}
            </div>

            {entries.length > 0 && (
              <button
                type="button"
                className="category-head-row-collapsible"
                style={{ ...styles.collapseHeaderBtn, margin: "10px 0 4px" }}
                onClick={() =>
                  setExpandedGoals((prev) => ({ ...prev, [player.id]: !prev[player.id] }))
                }
              >
                {expandedGoals[player.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Target size={14} color="#1A1A1A" />
                <span style={styles.categoryLabel}>{entries.length} mål</span>
              </button>
            )}

            <div
              className={`category-skills${expandedGoals[player.id] ? " category-skills-open" : ""}`}
            >
            {entries.map(({ skillId, goal, skill, category }) => {
              const currentVal = scores[skillId];
              const achieved = typeof currentVal === "number" && currentVal >= goal.target;
              return (
                <div key={skillId} style={styles.goalOverviewRow}>
                  <div style={styles.goalOverviewTop}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ ...styles.dot, background: category.accent }} />
                        <span style={styles.skillName}>{skill.name}</span>
                        <span style={styles.goalOverviewCat}>{category.label}</span>
                      </div>
                      {(goal.note || goal.focusAreas) && (
                        <div style={styles.goalNote}>
                          {goal.note && (
                            <div>
                              <strong>Målsætning:</strong> {goal.note}
                            </div>
                          )}
                          {goal.focusAreas && (
                            <div>
                              <strong>Fokusområder:</strong> {goal.focusAreas}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        ...styles.goalChip,
                        ...(achieved ? styles.goalChipMet : styles.goalChipPending),
                      }}
                    >
                      <Target size={11} /> Mål {goal.target}
                      {achieved ? " ✓" : ""}
                    </span>
                  </div>
                  <ProgressTracker
                    value={goal.progress}
                    onChange={(v) => onSetGoalProgress(player.id, selectedPeriodId, skillId, v)}
                  />
                </div>
              );
            })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CoachesView({ coaches, teams, onCreate, onUpdate, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamId, setTeamId] = useState("");
  const [createError, setCreateError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editTeamId, setEditTeamId] = useState("");
  const [editError, setEditError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const submitCreate = async () => {
    if (!name.trim()) return;
    setCreateError("");
    try {
      await onCreate(name.trim(), email.trim(), teamId || null, password);
      setName("");
      setEmail("");
      setPassword("");
      setTeamId("");
      setCreating(false);
    } catch (e) {
      setCreateError(e.message);
    }
  };

  const startEdit = (coach) => {
    setEditingId(coach.id);
    setEditName(coach.name);
    setEditEmail(coach.email || "");
    setEditPassword("");
    setEditTeamId(coach.teamId || "");
    setEditError("");
  };

  const submitEdit = async () => {
    if (!editName.trim()) return;
    setEditError("");
    try {
      await onUpdate(editingId, {
        name: editName.trim(),
        email: editEmail.trim(),
        teamId: editTeamId || null,
        // Omitted (not even sent as "") when left blank, so the server
        // leaves the existing password alone — see routes/coaches.js.
        ...(editPassword ? { password: editPassword } : {}),
      });
      setEditingId(null);
    } catch (e) {
      setEditError(e.message);
    }
  };

  const confirmDelete = async () => {
    const id = confirmDeleteId;
    setDeleteError("");
    try {
      await onDelete(id);
      setConfirmDeleteId(null);
    } catch (e) {
      setDeleteError(e.message);
    }
  };

  const teamName = (id) => teams.find((t) => t.id === id)?.name || null;

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Trænere</h1>
          <p style={styles.subtext}>
            Opret trænerprofiler, så de kan knyttes til opfølgninger og hold.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setCreating(true)}>
          <Plus size={16} /> Ny træner
        </button>
      </div>

      {creating && (
        <div style={styles.addCardCol}>
          {createError && <div style={styles.errorBannerRow}>{createError}</div>}
          <input
            style={styles.input}
            placeholder="Navn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            style={styles.input}
            type="email"
            placeholder="E-mail (bruges til login)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Adgangskode (mindst 6 tegn)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {teams.length > 0 && (
            <div>
              <div style={styles.fieldLabel}>Hold</div>
              <select style={styles.select} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                <option value="">Intet hold</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtn} onClick={submitCreate}>
              Opret
            </button>
            <button style={styles.ghostBtn} onClick={() => setCreating(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {coaches.length === 0 && !creating && (
        <div style={styles.emptyState}>
          <UserCog size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen trænere endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Opret en træner, så du kan knytte dem til opfølgninger.
          </div>
        </div>
      )}

      {coaches.map((c) => (
        <div key={c.id} style={styles.periodRow}>
          {editingId === c.id ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
              {editError && <div style={{ ...styles.errorBannerRow, width: "100%" }}>{editError}</div>}
              <input
                style={styles.input}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              <input
                style={styles.input}
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Ny adgangskode (lad stå tom for at beholde)"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
              {teams.length > 0 && (
                <select
                  style={styles.select}
                  value={editTeamId}
                  onChange={(e) => setEditTeamId(e.target.value)}
                >
                  <option value="">Intet hold</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
              <button style={styles.primaryBtnSm} onClick={submitEdit}>
                Gem
              </button>
              <button style={styles.ghostBtn} onClick={() => setEditingId(null)}>
                Annuller
              </button>
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={styles.subtext}>
                  {c.email || "Ingen e-mail"}
                  {teamName(c.teamId) ? ` · ${teamName(c.teamId)}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={styles.iconBtn} onClick={() => startEdit(c)} title="Rediger">
                  <Pencil size={14} />
                </button>
                <button
                  style={{ ...styles.iconBtn, color: "#E2231A" }}
                  onClick={() => setConfirmDeleteId(c.id)}
                  title="Slet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {confirmDeleteId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalTitle}>Slet denne træner?</div>
            <div style={styles.modalBody}>
              Tidligere registrerede opfølgninger bevares, men vises ikke længere med trænerens
              navn.
            </div>
            {deleteError && <div style={styles.errorBannerRow}>{deleteError}</div>}
            <div style={styles.modalActions}>
              <button
                style={styles.ghostBtn}
                onClick={() => {
                  setConfirmDeleteId(null);
                  setDeleteError("");
                }}
              >
                Annuller
              </button>
              <button style={styles.dangerBtn} onClick={confirmDelete}>
                Slet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FollowupsLogView({ data, onRemoveFollowup }) {
  const [playerFilter, setPlayerFilter] = useState("all");
  const [coachFilter, setCoachFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const allFollowups = [];
  Object.keys(data.followups || {}).forEach((playerId) => {
    const player = data.players.find((p) => p.id === playerId);
    (data.followups[playerId] || []).forEach((f) => {
      allFollowups.push({
        ...f,
        playerId,
        playerName: player ? player.name : "Ukendt spiller",
      });
    });
  });
  allFollowups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const monthKey = (iso) => iso.slice(0, 7);
  const monthLabel = (key) => {
    const dt = new Date(`${key}-01T00:00:00`);
    const label = dt.toLocaleDateString("da-DK", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const availableMonths = Array.from(new Set(allFollowups.map((f) => monthKey(f.createdAt)))).sort(
    (a, b) => b.localeCompare(a)
  );

  const filtered = allFollowups.filter((f) => {
    if (playerFilter !== "all" && f.playerId !== playerFilter) return false;
    if (coachFilter === "none" && f.coachId) return false;
    if (coachFilter !== "all" && coachFilter !== "none" && f.coachId !== coachFilter) return false;
    if (monthFilter !== "all" && monthKey(f.createdAt) !== monthFilter) return false;
    return true;
  });

  const coachName = (coachId) => (data.coaches || []).find((c) => c.id === coachId)?.name || null;

  return (
    <div>
      <h1 style={styles.h1}>Opfølgninger</h1>
      <p style={styles.subtext}>Alle registrerede opfølgninger på tværs af spillere.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0" }}>
        <div>
          <div style={styles.fieldLabel}>Spiller</div>
          <select
            style={styles.select}
            value={playerFilter}
            onChange={(e) => setPlayerFilter(e.target.value)}
          >
            <option value="all">Alle spillere</option>
            {data.players.filter((p) => p.active !== false).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={styles.fieldLabel}>Træner</div>
          <select
            style={styles.select}
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
          >
            <option value="all">Alle trænere</option>
            <option value="none">Ingen valgt</option>
            {(data.coaches || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={styles.fieldLabel}>Periode</div>
          <select
            style={styles.select}
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="all">Alle perioder</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={styles.emptyState}>
          <History size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>
            {allFollowups.length === 0
              ? "Ingen opfølgninger registreret endnu"
              : "Ingen opfølgninger matcher filtrene"}
          </div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            {allFollowups.length === 0
              ? "Registrér en opfølgning på en spiller fra Træneroverblik."
              : "Prøv at nulstille filtrene."}
          </div>
        </div>
      )}

      {filtered.map((f) => (
        <div key={f.id} style={styles.periodRow}>
          <div>
            <div style={{ fontWeight: 700 }}>{f.playerName}</div>
            <div style={styles.subtext}>
              {formatDate(f.createdAt.slice(0, 10))}
              {coachName(f.coachId) ? ` · ${coachName(f.coachId)}` : " · Ingen træner valgt"}
            </div>
            {f.note && <div style={styles.goalNote}>{f.note}</div>}
          </div>
          <button
            style={{ ...styles.iconBtn, color: "#E2231A" }}
            onClick={() => onRemoveFollowup(f.playerId, f.id)}
            title="Slet opfølgning"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function TeamsView({ teams, players, onCreate, onRename, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const submitCreate = async () => {
    if (!name.trim()) return;
    await onCreate(name.trim());
    setName("");
    setCreating(false);
  };

  const submitEdit = async () => {
    if (!editName.trim()) return;
    await onRename(editingId, editName.trim());
    setEditingId(null);
  };

  const countFor = (teamId) => players.filter((p) => p.teamId === teamId).length;

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Hold</h1>
          <p style={styles.subtext}>
            Oprettes én gang — knyt en spiller til et hold fra spillerens profil eller når du
            opretter spilleren.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setCreating(true)}>
          <Plus size={16} /> Nyt hold
        </button>
      </div>

      {creating && (
        <div style={styles.addCardCol}>
          <input
            style={styles.input}
            placeholder="Holdnavn (fx U14 Drenge)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtn} onClick={submitCreate}>
              Opret
            </button>
            <button style={styles.ghostBtn} onClick={() => setCreating(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {teams.length === 0 && !creating && (
        <div style={styles.emptyState}>
          <Layers size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen hold endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Opret ét (fx "U14 Drenge"), så spillere kan knyttes til det.
          </div>
        </div>
      )}

      {teams.map((t) => (
        <div key={t.id} style={styles.periodRow}>
          {editingId === t.id ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
              <input
                style={styles.input}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              <button style={styles.primaryBtnSm} onClick={submitEdit}>
                Gem
              </button>
              <button style={styles.ghostBtn} onClick={() => setEditingId(null)}>
                Annuller
              </button>
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div style={styles.subtext}>
                  {countFor(t.id)} spiller{countFor(t.id) !== 1 ? "e" : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  style={styles.iconBtn}
                  onClick={() => {
                    setEditingId(t.id);
                    setEditName(t.name);
                  }}
                  title="Omdøb"
                >
                  <Pencil size={14} />
                </button>
                <button
                  style={{ ...styles.iconBtn, color: "#E2231A" }}
                  onClick={() => setConfirmDeleteId(t.id)}
                  title="Slet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {confirmDeleteId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalTitle}>Slet dette hold?</div>
            <div style={styles.modalBody}>
              Spillere knyttet til det bliver frigjort — deres scores og mål bevares.
            </div>
            <div style={styles.modalActions}>
              <button style={styles.ghostBtn} onClick={() => setConfirmDeleteId(null)}>
                Annuller
              </button>
              <button
                style={styles.dangerBtn}
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Slet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RosterView({
  data,
  periods,
  onOpen,
  addingPlayer,
  setAddingPlayer,
  newName,
  setNewName,
  newPrimaryPosition,
  setNewPrimaryPosition,
  newSecondaryPosition,
  setNewSecondaryPosition,
  newNumber,
  setNewNumber,
  newEmail,
  setNewEmail,
  newTeamId,
  setNewTeamId,
  newSkillGroupId,
  setNewSkillGroupId,
  onAdd,
}) {
  const [teamFilter, setTeamFilter] = useState("all");
  const [sortMode, setSortMode] = useState("alpha");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [emailsCopied, setEmailsCopied] = useState(false);
  const teams = data.teams || [];

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds([]);
    setSendResult(null);
    setEmailsCopied(false);
  };

  const toggleSelected = (playerId) => {
    setSelectedIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const selectAllWithEmail = () => {
    setSelectedIds(visiblePlayers.filter((p) => p.email && p.active !== false).map((p) => p.id));
  };

  const copySelectedEmails = async () => {
    const emails = data.players
      .filter((p) => selectedIds.includes(p.id) && p.email && p.active !== false)
      .map((p) => p.email);
    if (emails.length === 0) return;
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setEmailsCopied(true);
      setTimeout(() => setEmailsCopied(false), 2000);
    } catch (e) {
      /* clipboard not available */
    }
  };

  const sendNotifications = async () => {
    if (selectedIds.length === 0) return;
    setSending(true);
    setSendResult(null);
    try {
      const { results } = await api.sendSelfEvalNotifications(selectedIds);
      const okCount = results.filter((r) => r.ok).length;
      const failCount = results.length - okCount;
      setSendResult({
        ok: failCount === 0,
        message:
          failCount === 0
            ? `Selvevaluering sendt til ${okCount} spiller${okCount !== 1 ? "e" : ""}.`
            : `Sendt til ${okCount} spiller${okCount !== 1 ? "e" : ""}. ${failCount} kunne ikke modtage e-mail (mangler adresse eller afsendelsen fejlede).`,
      });
      setSelectMode(false);
      setSelectedIds([]);
    } catch (e) {
      setSendResult({
        ok: false,
        message:
          e.message === "E-mailafsendelse er ikke konfigureret endnu"
            ? e.message
            : "Kunne ikke sende e-mails — tjek din forbindelse og prøv igen.",
      });
    } finally {
      setSending(false);
    }
  };

  const teamName = (teamId) => teams.find((t) => t.id === teamId)?.name || null;

  const visiblePlayers =
    teamFilter === "all"
      ? data.players
      : teamFilter === "none"
      ? data.players.filter((p) => !p.teamId)
      : data.players.filter((p) => p.teamId === teamFilter);

  const levelById = {};
  (data.config.participationLevels || []).forEach((l) => {
    levelById[l.id] = l;
  });

  const playersWithStats = visiblePlayers.map((p) => {
    const latestPeriod = getLatestScoredPeriod(data, p.id);
    const scores = latestPeriod ? getPlayerScores(data, p.id, latestPeriod.id) : {};
    const overall = overallAverage(data.config, scores, p);
    const goals = (latestPeriod && data.goals[p.id]?.[latestPeriod.id]) || {};
    const goalIds = Object.keys(goals);
    const goalsMet = goalIds.filter(
      (id) => typeof scores[id] === "number" && scores[id] >= goals[id].target
    ).length;
    const level = levelById[p.participationLevelId] || null;
    const latestSelfEval = getLatestSelfEval(data, p.id);
    const selfEvalGaps = getSelfEvalGaps(data, p.id);
    return { player: p, scores, overall, goals, goalIds, goalsMet, latestPeriod, level, latestSelfEval, selfEvalGaps };
  });

  // Best score (or highest participation level) on top; players with no
  // value at all sort to the bottom.
  const sortedByMode =
    sortMode === "score"
      ? [...playersWithStats].sort((a, b) => (b.overall ?? -Infinity) - (a.overall ?? -Infinity))
      : sortMode === "level"
      ? [...playersWithStats].sort(
          (a, b) => (b.level?.numericValue ?? -Infinity) - (a.level?.numericValue ?? -Infinity)
        )
      : playersWithStats;
  // Inactive players go last whatever the sort, keeping that order among them.
  const sortedPlayers = [
    ...sortedByMode.filter((x) => x.player.active !== false),
    ...sortedByMode.filter((x) => x.player.active === false),
  ];

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Spillertrup</h1>
          <p style={styles.subtext}>
            {visiblePlayers.length} af {data.players.length} spiller
            {data.players.length !== 1 ? "e" : ""} · delt med alle trænere
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setAddingPlayer(true)}>
          <Plus size={16} /> Tilføj spiller
        </button>
      </div>

      {sendResult && (
        <div style={sendResult.ok ? styles.successBanner : styles.errorBannerRow}>
          {sendResult.message}
          <button style={styles.iconBtnGhost} onClick={() => setSendResult(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          style={{ ...styles.teamFilterChip, ...(sortMode === "score" ? styles.teamFilterChipActive : {}) }}
          onClick={() => setSortMode((v) => (v === "score" ? "alpha" : "score"))}
        >
          <ArrowUpDown size={14} /> {sortMode === "score" ? "Sortér alfabetisk" : "Sortér efter score"}
        </button>
        <button
          style={{ ...styles.teamFilterChip, ...(sortMode === "level" ? styles.teamFilterChipActive : {}) }}
          onClick={() => setSortMode((v) => (v === "level" ? "alpha" : "level"))}
        >
          <BarChart3 size={14} /> {sortMode === "level" ? "Sortér alfabetisk" : "Sortér efter niveau"}
        </button>
        <button
          style={{ ...styles.teamFilterChip, ...(selectMode ? styles.teamFilterChipActive : {}) }}
          onClick={toggleSelectMode}
        >
          <Mail size={14} /> {selectMode ? "Annuller" : "Send selvevaluering"}
        </button>
      </div>

      {selectMode && (
        <div style={styles.selectActionBar}>
          <span>
            {selectedIds.length} spiller{selectedIds.length !== 1 ? "e" : ""} valgt
          </span>
          <button style={styles.ghostBtn} onClick={selectAllWithEmail}>
            Vælg alle med e-mail
          </button>
          <button
            style={styles.ghostBtn}
            onClick={copySelectedEmails}
            disabled={selectedIds.length === 0}
          >
            {emailsCopied ? <Check size={14} /> : <Copy size={14} />}{" "}
            {emailsCopied ? "Kopieret" : `Kopiér e-mails (${selectedIds.length})`}
          </button>
          <button
            style={styles.primaryBtn}
            onClick={sendNotifications}
            disabled={selectedIds.length === 0 || sending}
          >
            {sending ? "Sender…" : `Send (${selectedIds.length})`}
          </button>
        </div>
      )}

      {teams.length > 0 && (
        <div style={styles.teamFilterRow}>
          <button
            style={{
              ...styles.teamFilterChip,
              ...(teamFilter === "all" ? styles.teamFilterChipActive : {}),
            }}
            onClick={() => setTeamFilter("all")}
          >
            Alle
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              style={{
                ...styles.teamFilterChip,
                ...(teamFilter === t.id ? styles.teamFilterChipActive : {}),
              }}
              onClick={() => setTeamFilter(t.id)}
            >
              {t.name}
            </button>
          ))}
          <button
            style={{
              ...styles.teamFilterChip,
              ...(teamFilter === "none" ? styles.teamFilterChipActive : {}),
            }}
            onClick={() => setTeamFilter("none")}
          >
            Intet hold
          </button>
        </div>
      )}

      {addingPlayer && (
        <div style={styles.addCardCol}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={styles.input}
              placeholder="Spillernavn"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <input
              style={{ ...styles.input, maxWidth: 90 }}
              placeholder="Nr."
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
            />
            <input
              style={styles.input}
              type="email"
              placeholder="E-mail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          {teams.length > 0 && (
            <div>
              <div style={styles.fieldLabel}>Hold</div>
              <select
                style={styles.select}
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
              >
                <option value="">Intet hold</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <div style={styles.fieldLabel}>Kriteriegruppe</div>
            <select
              style={styles.select}
              value={newSkillGroupId}
              onChange={(e) => setNewSkillGroupId(e.target.value)}
            >
              {(data.config.groups || []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <PositionFields
            primaryPosition={newPrimaryPosition}
            secondaryPosition={newSecondaryPosition}
            onChangePrimary={setNewPrimaryPosition}
            onChangeSecondary={setNewSecondaryPosition}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtn} onClick={onAdd}>
              Gem
            </button>
            <button style={styles.ghostBtn} onClick={() => setAddingPlayer(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {data.players.length === 0 && !addingPlayer && (
        <div style={styles.emptyState}>
          <Shield size={32} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen spillere endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Tilføj din første spiller for at begynde udviklingen.
          </div>
        </div>
      )}

      {data.players.length > 0 && visiblePlayers.length === 0 && (
        <div style={styles.emptyState}>
          <div style={{ fontWeight: 600 }}>Ingen spillere på dette hold</div>
        </div>
      )}

      <div style={styles.grid}>
        {sortedPlayers.map(({ player: p, scores, overall, goals, goalIds, goalsMet, latestPeriod, level, latestSelfEval, selfEvalGaps }) => {
          const isSelected = selectedIds.includes(p.id);
          const inactive = p.active === false;
          const selectableDisabled = selectMode && (!p.email || inactive);
          return (
            <div
              key={p.id}
              style={{
                ...styles.playerCard,
                ...(selectMode && isSelected ? styles.playerCardSelected : {}),
                ...(inactive && !selectMode ? { opacity: 0.55 } : {}),
                ...(selectableDisabled ? styles.playerCardDisabled : {}),
              }}
              onClick={() => {
                if (selectMode) {
                  if (!selectableDisabled) toggleSelected(p.id);
                } else {
                  onOpen(p.id);
                }
              }}
            >
              <div style={styles.playerCardTop}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={selectableDisabled}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelected(p.id)}
                      title={inactive ? "Spilleren er inaktiv" : p.email ? "" : "Spilleren mangler en e-mailadresse"}
                    />
                  )}
                  <div style={styles.numberBadge}>{p.number || "—"}</div>
                </div>
                <div
                  style={{
                    ...styles.overallPill,
                    background: scoreColor(overall ? Math.round(overall) : null),
                  }}
                >
                  {overall ? overall.toFixed(1) : "—"}
                </div>
              </div>
              <div style={styles.playerName}>{p.name}</div>
              <div style={styles.playerPos}>{formatPlayerPositions(p) || "Position ikke angivet"}</div>
              {inactive && <div style={styles.teamBadge}>Inaktiv</div>}
              {teamName(p.teamId) && (
                <div style={styles.teamBadge}>
                  <Layers size={10} /> {teamName(p.teamId)}
                </div>
              )}
              {level && (
                <div style={styles.teamBadge}>
                  <BarChart3 size={10} /> {level.name}
                </div>
              )}
              <div style={styles.miniBars}>
                {CATEGORY_META.map((c) => {
                  const avg = categoryAverage(data.config, scores, c.key, p);
                  return (
                    <div key={c.key} style={styles.miniBarTrack} title={`${c.label}: ${avg ? avg.toFixed(1) : "—"}`}>
                      <div
                        style={{
                          ...styles.miniBarFill,
                          width: avg ? `${(avg / 5) * 100}%` : "0%",
                          background: c.accent,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              {goalIds.length > 0 && (
                <div
                  style={{
                    ...styles.goalChip,
                    ...(goalsMet === goalIds.length ? styles.goalChipMet : styles.goalChipPending),
                    marginTop: 10,
                  }}
                >
                  <Target size={11} /> {goalsMet} af {goalIds.length} mål nået
                </div>
              )}
              <div style={styles.evalCountTag}>
                {periods.length === 0
                  ? "Ingen perioder oprettet endnu"
                  : latestPeriod
                  ? `Seneste vurdering: ${latestPeriod.label} · ${formatDate(latestPeriod.date)}`
                  : "Ikke vurderet endnu"}
              </div>
              <div style={styles.evalCountTag}>
                {latestSelfEval
                  ? `Seneste selvevaluering: ${latestSelfEval.progress}/10 · ${formatDate(
                      String(latestSelfEval.createdAt).slice(0, 10)
                    )}`
                  : "Ingen selvevaluering endnu"}
              </div>
              {selfEvalGaps.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: "#FFF1D6",
                    border: "1px solid #E8C46A",
                    color: "#7A4B00",
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                  title="Trænerens vurdering og spillerens seneste selvevaluering er mere end 2 fra hinanden"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 700 }}>
                    <AlertTriangle size={12} />
                    Vurderingerne afviger
                  </div>
                  {selfEvalGaps.slice(0, 2).map((g) => (
                    <div key={g.name}>
                      {g.name}: træner {g.coach} · spiller {g.player}
                    </div>
                  ))}
                  {selfEvalGaps.length > 2 && <div>+{selfEvalGaps.length - 2} mere</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerView({
  player,
  config,
  periods,
  teams,
  evaluations,
  goals,
  onBack,
  onScore,
  onDelete,
  onSetActive,
  onUpdatePositions,
  onUpdateTeam,
  onUpdateEmail,
  onUpdateNumber,
  onSetGoal,
  onSetGoalProgress,
  onRemoveGoal,
  onSetSkillGroup,
  onUpdateParticipationLevel,
  onUpdateGoalHorizons,
  onGoToPeriods,
  developmentPlan,
  onSaveDevelopmentPlan,
  backLabel,
}) {
  // The app's own header (ClubHeader) is already position:sticky/top:0, so
  // the back button can't also stick at top:0 — it needs to sit right
  // below the header's actual rendered height instead, which varies (the
  // coach name/logout row wraps differently at different widths), hence
  // measuring it rather than hardcoding a pixel value.
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header");
      setHeaderHeight(header ? header.offsetHeight : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const [editingPositions, setEditingPositions] = useState(false);
  const [editingTeam, setEditingTeam] = useState(false);
  const [editingLevel, setEditingLevel] = useState(false);
  const [editingSkillGroup, setEditingSkillGroup] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(player.email || "");
  const [editingNumber, setEditingNumber] = useState(false);
  const [numberDraft, setNumberDraft] = useState(player.number || "");
  const [selectedPeriodId, setSelectedPeriodId] = useState(
    periods.length ? periods[periods.length - 1].id : null
  );
  const [compareMode, setCompareMode] = useState(false);
  const [goalEditingId, setGoalEditingId] = useState(null);
  const [goalTargetDraft, setGoalTargetDraft] = useState(4);
  const [goalNoteDraft, setGoalNoteDraft] = useState("");
  const [goalFocusAreasDraft, setGoalFocusAreasDraft] = useState("");
  const [drilldownCat, setDrilldownCat] = useState(null);
  const [printPanelOpen, setPrintPanelOpen] = useState(false);
  const [printColBMode, setPrintColBMode] = useState("goal");
  const [printColBPeriodId, setPrintColBPeriodId] = useState(null);
  // Each category (Teknik/Fysisk/Taktik/Mentalt) starts collapsed — tap a
  // category's header (or its chevron) to expand just that one and see/
  // score its individual skills. Same on every screen size.
  const [expandedCats, setExpandedCats] = useState({});
  // Number/hold/niveau/e-mail/gruppe — same collapse-by-default pattern as
  // the category blocks below, as one group rather than five separate
  // toggles since they're edited together rarely and just add scroll
  // length above the actual evaluation.
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  useEffect(() => {
    if (!selectedPeriodId && periods.length) {
      setSelectedPeriodId(periods[periods.length - 1].id);
    }
    if (selectedPeriodId && !periods.find((p) => p.id === selectedPeriodId)) {
      setSelectedPeriodId(periods.length ? periods[periods.length - 1].id : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods.length]);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) || null;
  const scores = selectedPeriod ? evaluations[selectedPeriod.id]?.scores || {} : {};
  // Goals are scoped per evaluation period — always the one currently
  // selected via the period tabs, same as scores.
  const periodGoals = (selectedPeriod && goals[selectedPeriod.id]) || {};

  const openGoalEditor = (skillId) => {
    const existing = periodGoals[skillId];
    setGoalEditingId(skillId);
    setGoalTargetDraft(existing ? existing.target : 4);
    setGoalNoteDraft(existing ? existing.note : "");
    setGoalFocusAreasDraft(existing ? existing.focusAreas : "");
  };

  const saveGoal = (skillId) => {
    if (!selectedPeriod) return;
    onSetGoal(selectedPeriod.id, skillId, goalTargetDraft, goalNoteDraft.trim(), goalFocusAreasDraft.trim());
    setGoalEditingId(null);
  };

  const hasGoals = Object.keys(periodGoals).length > 0;

  const radarData = CATEGORY_META.map((c) => ({
    subject: c.short,
    value: categoryAverage(config, scores, c.key, player) || 0,
    goal: categoryGoalAverage(config, periodGoals, c.key, player) || 0,
  }));

  return (
    <div>
      <style>{`
        .category-skills { display: none; }
        .category-skills.category-skills-open { display: block; }
        .category-head-row-collapsible { cursor: pointer; }
        .player-settings { display: none; }
        .player-settings.player-settings-open { display: block; }
      `}</style>
      <div style={{ ...styles.backBarSticky, top: headerHeight }}>
        <button style={styles.backBtnInBar} onClick={onBack}>
          <ChevronLeft size={16} /> {backLabel || "Spillertrup"}
        </button>
      </div>

      <div style={styles.playerHeadRow}>
        <div style={styles.numberBadgeLg}>{player.number || "—"}</div>
        <div style={{ flex: 1 }}>
          <h1 style={styles.h1}>{player.name}</h1>
          {player.active === false && <div style={{ ...styles.teamBadge, marginBottom: 6 }}>Inaktiv</div>}
          {!editingPositions && (
            <div style={styles.positionRow}>
              <span style={styles.subtext}>{formatPlayerPositions(player) || "Position ikke angivet"}</span>
              <button style={styles.linkBtn} onClick={() => setEditingPositions(true)}>
                <Pencil size={12} /> Rediger
              </button>
            </div>
          )}
        </div>
        <button
          style={{ ...styles.ghostBtn, padding: "6px 12px", fontSize: 13 }}
          onClick={() => onSetActive(player.active === false)}
          title={
            player.active === false
              ? "Gør spilleren aktiv igen, så hun kan vælges i kampplanen m.m."
              : "Inaktive spillere står nederst i spillertruppen og kan ikke vælges andre steder"
          }
        >
          {player.active === false ? "Sæt aktiv" : "Sæt inaktiv"}
        </button>
        <button style={styles.iconDangerBtn} onClick={onDelete} title="Fjern spiller">
          <Trash2 size={16} />
        </button>
      </div>

      {editingPositions && (
        <div style={styles.positionEditCard}>
          <PositionFields
            primaryPosition={player.primaryPosition}
            secondaryPosition={player.secondaryPosition}
            onChangePrimary={(primaryPosition) => onUpdatePositions({ primaryPosition })}
            onChangeSecondary={(secondaryPosition) => onUpdatePositions({ secondaryPosition })}
          />
          <button style={{ ...styles.ghostBtn, marginTop: 12 }} onClick={() => setEditingPositions(false)}>
            Færdig
          </button>
        </div>
      )}

      <div style={styles.categoryBlock}>
      <button
        type="button"
        className="category-head-row-collapsible"
        style={{ ...styles.collapseHeaderBtn, marginBottom: 8 }}
        onClick={() => setSettingsExpanded((v) => !v)}
      >
        {settingsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Settings size={14} color="#1A1A1A" />
        <span style={styles.categoryLabel}>Indstillinger</span>
      </button>

      <div className={`player-settings${settingsExpanded ? " player-settings-open" : ""}`}>

      <div style={styles.teamRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Hash size={14} color="#6B6B6B" />
          {!editingNumber && (
            <span style={styles.subtext}>{player.number || "Intet nummer angivet"}</span>
          )}
          {editingNumber && (
            <input
              style={{ ...styles.input, maxWidth: 100 }}
              type="text"
              inputMode="numeric"
              value={numberDraft}
              onChange={(e) => setNumberDraft(e.target.value)}
              autoFocus
            />
          )}
        </div>
        {!editingNumber && (
          <button
            style={styles.linkBtn}
            onClick={() => {
              setNumberDraft(player.number || "");
              setEditingNumber(true);
            }}
          >
            <Pencil size={12} /> Rediger
          </button>
        )}
        {editingNumber && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={styles.linkBtn}
              onClick={() => {
                onUpdateNumber(numberDraft.trim());
                setEditingNumber(false);
              }}
            >
              Gem
            </button>
            <button style={styles.linkBtn} onClick={() => setEditingNumber(false)}>
              Annuller
            </button>
          </div>
        )}
      </div>

      {teams.length > 0 && (
        <div style={styles.teamRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Layers size={14} color="#6B6B6B" />
            {!editingTeam && (
              <span style={styles.subtext}>
                {teams.find((t) => t.id === player.teamId)?.name || "Intet hold tilknyttet"}
              </span>
            )}
            {editingTeam && (
              <select
                style={{ ...styles.select, maxWidth: 220 }}
                value={player.teamId || ""}
                onChange={(e) => onUpdateTeam(e.target.value || null)}
                autoFocus
              >
                <option value="">Intet hold</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button style={styles.linkBtn} onClick={() => setEditingTeam((v) => !v)}>
            <Pencil size={12} /> {editingTeam ? "Færdig" : "Rediger"}
          </button>
        </div>
      )}

      {(config.participationLevels || []).length > 0 && (
        <div style={styles.teamRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={14} color="#6B6B6B" />
            {!editingLevel && (
              <span style={styles.subtext}>
                {config.participationLevels.find((l) => l.id === player.participationLevelId)
                  ?.name || "Intet niveau valgt"}
              </span>
            )}
            {editingLevel && (
              <select
                style={{ ...styles.select, maxWidth: 220 }}
                value={player.participationLevelId || ""}
                onChange={(e) => onUpdateParticipationLevel(e.target.value || null)}
                autoFocus
              >
                <option value="">Intet niveau valgt</option>
                {[...config.participationLevels]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <button style={styles.linkBtn} onClick={() => setEditingLevel((v) => !v)}>
            <Pencil size={12} /> {editingLevel ? "Færdig" : "Rediger"}
          </button>
        </div>
      )}

      <div style={styles.teamRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mail size={14} color="#6B6B6B" />
          {!editingEmail && (
            <span style={styles.subtext}>{player.email || "Ingen e-mail angivet"}</span>
          )}
          {editingEmail && (
            <input
              style={{ ...styles.input, maxWidth: 260 }}
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              autoFocus
            />
          )}
        </div>
        {!editingEmail && (
          <button
            style={styles.linkBtn}
            onClick={() => {
              setEmailDraft(player.email || "");
              setEditingEmail(true);
            }}
          >
            <Pencil size={12} /> Rediger
          </button>
        )}
        {editingEmail && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={styles.linkBtn}
              onClick={() => {
                onUpdateEmail(emailDraft.trim());
                setEditingEmail(false);
              }}
            >
              Gem
            </button>
            <button style={styles.linkBtn} onClick={() => setEditingEmail(false)}>
              Annuller
            </button>
          </div>
        )}
      </div>

      <div style={styles.teamRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SlidersHorizontal size={14} color="#6B6B6B" />
          {!editingSkillGroup && (
            <span style={styles.subtext}>
              {(config.groups || []).find((g) => g.id === player.skillGroupId)?.name ||
                "Ingen gruppe valgt"}
            </span>
          )}
          {editingSkillGroup && (
            <select
              style={{ ...styles.select, maxWidth: 220 }}
              value={player.skillGroupId}
              onChange={(e) => onSetSkillGroup(e.target.value)}
              autoFocus
            >
              {(config.groups || []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button style={styles.linkBtn} onClick={() => setEditingSkillGroup((v) => !v)}>
          <Pencil size={12} /> {editingSkillGroup ? "Færdig" : "Rediger"}
        </button>
      </div>

      </div>
      </div>

      <LongTermGoalsCard player={player} onSave={onUpdateGoalHorizons} />

      <GoalsOverview
        config={config}
        goals={periodGoals}
        scores={scores}
        periodLabel={selectedPeriod ? selectedPeriod.label : null}
        goalEditingId={goalEditingId}
        goalTargetDraft={goalTargetDraft}
        goalNoteDraft={goalNoteDraft}
        goalFocusAreasDraft={goalFocusAreasDraft}
        setGoalTargetDraft={setGoalTargetDraft}
        setGoalNoteDraft={setGoalNoteDraft}
        setGoalFocusAreasDraft={setGoalFocusAreasDraft}
        onOpenEditor={openGoalEditor}
        onCloseEditor={() => setGoalEditingId(null)}
        onSave={saveGoal}
        onRemove={(skillId) => selectedPeriod && onRemoveGoal(selectedPeriod.id, skillId)}
        onSetProgress={(skillId, progress) =>
          selectedPeriod && onSetGoalProgress(selectedPeriod.id, skillId, progress)
        }
      />

      <SelfEvalHistory config={config} goals={goals} periods={periods} />

      <DevelopmentPlanCard player={player} plan={developmentPlan} onSave={onSaveDevelopmentPlan} />

      {periods.length === 0 ? (
        <div style={styles.emptyState}>
          <CalendarRange size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen evalueringsperioder endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14, marginBottom: 12 }}>
            Perioder oprettes én gang og deles af alle spillere.
          </div>
          <button style={styles.primaryBtnSm} onClick={onGoToPeriods}>
            <Plus size={14} /> Opret periode
          </button>
        </div>
      ) : (
        <>
          <div style={styles.evalBar}>
            <div style={styles.evalTabs}>
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPeriodId(p.id);
                    setCompareMode(false);
                    setGoalEditingId(null);
                    setDrilldownCat(null);
                  }}
                  style={{
                    ...styles.evalTab,
                    ...(selectedPeriodId === p.id && !compareMode ? styles.evalTabActive : {}),
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{p.label}</div>
                  <div style={styles.evalTabDate}>{formatDate(p.date)}</div>
                </button>
              ))}
            </div>
            {periods.length >= 2 && (
              <button
                style={{
                  ...styles.compareBtn,
                  ...(compareMode ? styles.compareBtnActive : {}),
                }}
                onClick={() => {
                  setCompareMode((v) => !v);
                  setDrilldownCat(null);
                }}
              >
                <GitCompare size={14} /> Sammenlign
              </button>
            )}
            {periods.length >= 1 && (
              <button
                style={{
                  ...styles.compareBtn,
                  ...(printPanelOpen ? styles.compareBtnActive : {}),
                }}
                onClick={() => setPrintPanelOpen((v) => !v)}
              >
                <Printer size={14} /> Udskriv rapport
              </button>
            )}
          </div>

          {printPanelOpen && (
            <div style={styles.addCardCol}>
              <div style={styles.fieldLabel}>Anden kolonne skal vise</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  style={{
                    ...styles.teamFilterChip,
                    ...(printColBMode === "goal" ? styles.teamFilterChipActive : {}),
                  }}
                  onClick={() => setPrintColBMode("goal")}
                >
                  Mål
                </button>
                <button
                  style={{
                    ...styles.teamFilterChip,
                    ...(printColBMode === "period" ? styles.teamFilterChipActive : {}),
                  }}
                  onClick={() => {
                    setPrintColBMode("period");
                    if (!printColBPeriodId) {
                      const alt = periods.find((p) => p.id !== selectedPeriodId);
                      setPrintColBPeriodId(alt ? alt.id : periods[0].id);
                    }
                  }}
                >
                  Anden periode
                </button>
              </div>
              {printColBMode === "period" && periods.length >= 2 && (
                <div>
                  <div style={styles.fieldLabel}>Vælg periode til sammenligning</div>
                  <select
                    style={styles.select}
                    value={printColBPeriodId || ""}
                    onChange={(e) => setPrintColBPeriodId(e.target.value)}
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} · {formatDate(p.date)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <p style={styles.subtext}>
                Rapporten viser {selectedPeriod ? selectedPeriod.label : "den valgte periode"} i
                første kolonne, samt {printColBMode === "goal" ? "målene" : "den valgte periode"}{" "}
                i anden kolonne — på én side, klar til udskrift eller "Gem som PDF".
              </p>
              <button
                style={styles.primaryBtn}
                onClick={() => window.print()}
              >
                <Printer size={16} /> Udskriv nu
              </button>
            </div>
          )}

          {selectedPeriod &&
            createPortal(
              <>
                <CoverPagePrint player={player} config={config} />
                <PrintableReport
                  player={player}
                  teamName={teams.find((t) => t.id === player.teamId)?.name}
                  config={config}
                  goals={periodGoals}
                  colA={{
                    label: `${selectedPeriod.label} (${formatDate(selectedPeriod.date)})`,
                    scores,
                  }}
                  colB={
                    printColBMode === "goal"
                      ? {
                          label: "Mål",
                          scores: Object.fromEntries(
                            Object.keys(periodGoals).map((id) => [id, periodGoals[id].target])
                          ),
                        }
                      : {
                          label: (() => {
                            const p = periods.find((pp) => pp.id === printColBPeriodId);
                            return p ? `${p.label} (${formatDate(p.date)})` : "Anden periode";
                          })(),
                          scores: printColBPeriodId
                            ? evaluations[printColBPeriodId]?.scores || {}
                            : {},
                        }
                  }
                />
                {hasDevelopmentPlanContent(developmentPlan) && (
                  <DevelopmentPlanPrintSection player={player} plan={developmentPlan} />
                )}
              </>,
              document.body
            )}

          {compareMode && periods.length >= 2 ? (
            <CompareView config={config} periods={periods} evaluations={evaluations} player={player} />
          ) : (
            selectedPeriod && (
              <>
                <div style={styles.radarCard}>
                  <p style={styles.radarHint}>Tryk på en kategori for at se de enkelte kriterier</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData} outerRadius="65%">
                      <PolarGrid stroke="#D9D4C7" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={(props) => (
                          <CategoryAxisTick {...props} onSelect={setDrilldownCat} />
                        )}
                      />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar
                        name="Træner"
                        dataKey="value"
                        stroke="#E2231A"
                        fill="#E2231A"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                      {hasGoals && (
                        <Radar
                          name="Mål"
                          dataKey="goal"
                          stroke={GOAL_COLOR}
                          fill="transparent"
                          strokeWidth={2}
                          strokeDasharray="5 4"
                          isAnimationActive={false}
                        />
                      )}
                      {hasGoals && (
                        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
                      )}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {drilldownCat && (
                  <SkillDrilldownRadar
                    config={config}
                    catKey={drilldownCat}
                    player={player}
                    scores={scores}
                    goals={periodGoals}
                    onClose={() => setDrilldownCat(null)}
                  />
                )}

                <div style={styles.evalMetaRow}>
                  <span style={styles.subtext}>
                    Redigerer <strong>{selectedPeriod.label}</strong> · {formatDate(selectedPeriod.date)}
                  </span>
                </div>

                {CATEGORY_META.map((cat) => {
                  const skills = categorySkillsForPlayer(config, player, cat.key);
                  const avg = categoryAverage(config, scores, cat.key, player);
                  const catExpanded = Boolean(expandedCats[cat.key]);
                  return (
                    <div key={cat.key} style={styles.categoryBlock}>
                      <div
                        className="category-head-row-collapsible"
                        style={styles.categoryHeadRow}
                        onClick={() => setExpandedCats((prev) => ({ ...prev, [cat.key]: !prev[cat.key] }))}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            type="button"
                            className="category-collapse-toggle"
                            style={styles.iconBtnGhost}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedCats((prev) => ({ ...prev, [cat.key]: !prev[cat.key] }));
                            }}
                            title={catExpanded ? "Skjul kriterier" : "Vis kriterier"}
                          >
                            {catExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <div style={{ ...styles.dot, background: cat.accent }} />
                          <span style={styles.categoryLabel}>{cat.label}</span>
                        </div>
                        <span style={{ ...styles.categoryAvg, color: cat.accent }}>
                          {avg ? avg.toFixed(1) : "—"}
                        </span>
                      </div>
                      <div className={`category-skills${catExpanded ? " category-skills-open" : ""}`}>
                      {skills.length === 0 ? (
                        <div style={styles.noSkills}>Ingen aktive kriterier i denne kategori.</div>
                      ) : (
                        skills.map((skill) => {
                          const goal = periodGoals[skill.id];
                          const currentVal = scores[skill.id];
                          const achieved =
                            goal && typeof currentVal === "number" && currentVal >= goal.target;
                          const isEditingGoal = goalEditingId === skill.id;
                          return (
                            <div key={skill.id} style={styles.skillBlock}>
                              <div style={styles.skillTopRow}>
                                <span style={styles.skillName}>{skill.name}</span>
                                {goal && !isEditingGoal && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span
                                      style={{
                                        ...styles.goalChip,
                                        ...(achieved ? styles.goalChipMet : styles.goalChipPending),
                                      }}
                                    >
                                      <Target size={11} /> Mål {goal.target}
                                      {achieved ? " ✓" : ""}
                                    </span>
                                    <button
                                      style={styles.iconBtnGhost}
                                      onClick={() => openGoalEditor(skill.id)}
                                      title="Rediger mål"
                                    >
                                      <Pencil size={11} />
                                    </button>
                                    <button
                                      style={styles.iconBtnGhost}
                                      onClick={() => onRemoveGoal(selectedPeriod.id, skill.id)}
                                      title="Fjern mål"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                )}
                                {!goal && !isEditingGoal && (
                                  <button style={styles.linkBtn} onClick={() => openGoalEditor(skill.id)}>
                                    <Target size={11} /> Sæt mål
                                  </button>
                                )}
                              </div>

                              {goal && (goal.note || goal.focusAreas) && !isEditingGoal && (
                                <div style={styles.goalNote}>
                                  {goal.note && (
                                    <div>
                                      <strong>Målsætning:</strong> {goal.note}
                                    </div>
                                  )}
                                  {goal.focusAreas && (
                                    <div>
                                      <strong>Fokusområder:</strong> {goal.focusAreas}
                                    </div>
                                  )}
                                </div>
                              )}

                              {isEditingGoal && (
                                <div style={styles.goalEditRow}>
                                  <div style={styles.fieldLabel}>Målscore</div>
                                  <div style={styles.scoreButtons}>
                                    {[1, 2, 3, 4, 5].map((v) => (
                                      <button
                                        key={v}
                                        onClick={() => setGoalTargetDraft(v)}
                                        style={{
                                          ...styles.scoreBtn,
                                          background: goalTargetDraft === v ? "#5C6B73" : "#FFFFFF",
                                          color: goalTargetDraft === v ? "#FFFFFF" : "#1A1A1A",
                                          borderColor: goalTargetDraft === v ? "#5C6B73" : "#D9D4C7",
                                        }}
                                      >
                                        {v}
                                      </button>
                                    ))}
                                  </div>
                                  <div style={styles.fieldLabel}>Målsætning (valgfrit)</div>
                                  <input
                                    style={styles.input}
                                    placeholder="fx forbedre boldkontrol under pres"
                                    value={goalNoteDraft}
                                    maxLength={120}
                                    onChange={(e) => setGoalNoteDraft(e.target.value)}
                                  />
                                  <div style={styles.charCount}>{goalNoteDraft.length}/120</div>
                                  <div style={styles.fieldLabel}>Fokusområder (valgfrit)</div>
                                  <input
                                    style={styles.input}
                                    placeholder="fx afleveringer, pres, positionering"
                                    value={goalFocusAreasDraft}
                                    maxLength={200}
                                    onChange={(e) => setGoalFocusAreasDraft(e.target.value)}
                                  />
                                  <div style={styles.charCount}>{goalFocusAreasDraft.length}/200</div>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                      style={styles.primaryBtnSm}
                                      onClick={() => saveGoal(skill.id)}
                                    >
                                      Gem mål
                                    </button>
                                    <button
                                      style={styles.ghostBtn}
                                      onClick={() => setGoalEditingId(null)}
                                    >
                                      Annuller
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div style={styles.scoreButtons}>
                                {[1, 2, 3, 4, 5].map((v) => {
                                  const active = scores[skill.id] === v;
                                  return (
                                    <button
                                      key={v}
                                      onClick={() => onScore(selectedPeriod.id, skill.id, v)}
                                      style={{
                                        ...styles.scoreBtn,
                                        background: active ? scoreColor(v) : "#FFFFFF",
                                        color: active ? "#FFFFFF" : "#1A1A1A",
                                        borderColor: active ? scoreColor(v) : "#D9D4C7",
                                      }}
                                    >
                                      {v}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                      </div>
                    </div>
                  );
                })}
              </>
            )
          )}
        </>
      )}

      <SelfEvalLinkCard token={player.selfToken} />
    </div>
  );
}

function GoalsOverview({
  config,
  goals,
  scores,
  periodLabel,
  goalEditingId,
  goalTargetDraft,
  goalNoteDraft,
  goalFocusAreasDraft,
  setGoalTargetDraft,
  setGoalNoteDraft,
  setGoalFocusAreasDraft,
  onOpenEditor,
  onCloseEditor,
  onSave,
  onRemove,
  onSetProgress,
}) {
  const entries = Object.keys(goals)
    .map((skillId) => {
      const meta = findSkillMeta(config, skillId);
      if (!meta) return null;
      return { skillId, goal: goals[skillId], ...meta };
    })
    .filter(Boolean)
    .sort((a, b) => a.category.label.localeCompare(b.category.label) || a.skill.name.localeCompare(b.skill.name));

  if (entries.length === 0) return null;

  const metCount = entries.filter(
    (e) => typeof scores[e.skillId] === "number" && scores[e.skillId] >= e.goal.target
  ).length;

  return (
    <div style={styles.goalsOverviewCard}>
      <div style={styles.goalsOverviewHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={16} color="#1A1A1A" />
          <span style={styles.categoryLabel}>Udviklingsmål</span>
        </div>
        <span style={styles.subtext}>
          {metCount} af {entries.length} nået{periodLabel ? ` · ${periodLabel}` : ""}
        </span>
      </div>

      {entries.map(({ skillId, goal, skill, category }) => {
        const currentVal = scores[skillId];
        const achieved = typeof currentVal === "number" && currentVal >= goal.target;
        const isEditing = goalEditingId === skillId;
        return (
          <div key={skillId} style={styles.goalOverviewRow}>
            <div style={styles.goalOverviewTop}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ ...styles.dot, background: category.accent }} />
                  <span style={styles.skillName}>{skill.name}</span>
                  <span style={styles.goalOverviewCat}>{category.label}</span>
                </div>
                {(goal.note || goal.focusAreas) && !isEditing && (
                  <div style={styles.goalNote}>
                    {goal.note && (
                      <div>
                        <strong>Målsætning:</strong> {goal.note}
                      </div>
                    )}
                    {goal.focusAreas && (
                      <div>
                        <strong>Fokusområder:</strong> {goal.focusAreas}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!isEditing && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      ...styles.goalChip,
                      ...(achieved ? styles.goalChipMet : styles.goalChipPending),
                    }}
                  >
                    <Target size={11} /> Mål {goal.target}
                    {achieved ? " ✓" : ""}
                  </span>
                  <button
                    style={styles.iconBtnGhost}
                    onClick={() => onOpenEditor(skillId)}
                    title="Rediger mål"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    style={styles.iconBtnGhost}
                    onClick={() => onRemove(skillId)}
                    title="Fjern mål"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div style={styles.goalEditRow}>
                <div style={styles.fieldLabel}>Målscore</div>
                <div style={styles.scoreButtons}>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setGoalTargetDraft(v)}
                      style={{
                        ...styles.scoreBtn,
                        background: goalTargetDraft === v ? "#5C6B73" : "#FFFFFF",
                        color: goalTargetDraft === v ? "#FFFFFF" : "#1A1A1A",
                        borderColor: goalTargetDraft === v ? "#5C6B73" : "#D9D4C7",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div style={styles.fieldLabel}>Målsætning (valgfrit)</div>
                <input
                  style={styles.input}
                  placeholder="fx forbedre boldkontrol under pres"
                  value={goalNoteDraft}
                  maxLength={120}
                  onChange={(e) => setGoalNoteDraft(e.target.value)}
                />
                <div style={styles.charCount}>{goalNoteDraft.length}/120</div>
                <div style={styles.fieldLabel}>Fokusområder (valgfrit)</div>
                <input
                  style={styles.input}
                  placeholder="fx afleveringer, pres, positionering"
                  value={goalFocusAreasDraft}
                  maxLength={200}
                  onChange={(e) => setGoalFocusAreasDraft(e.target.value)}
                />
                <div style={styles.charCount}>{goalFocusAreasDraft.length}/200</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={styles.primaryBtnSm} onClick={() => onSave(skillId)}>
                    Gem mål
                  </button>
                  <button style={styles.ghostBtn} onClick={onCloseEditor}>
                    Annuller
                  </button>
                </div>
              </div>
            )}

            {!isEditing && (
              <ProgressTracker
                value={goal.progress}
                onChange={(v) => onSetProgress(skillId, v)}
                compact
              />
            )}
            {!isEditing && <LatestSelfEval goal={goal} />}
          </div>
        );
      })}
    </div>
  );
}

function PrintStyles() {
  // The report is rendered into a portal directly under <body>, outside the
  // app's own DOM tree (see PrintableReport's call sites). That means print
  // mode can simply hide the whole app (#root) rather than trying to hide
  // "everything except the report" within it — the old approach used
  // `visibility: hidden` on the app, which keeps its full (often very tall)
  // layout height, and browsers paginate print output based on that full
  // invisible height, producing a run of blank pages after the report.
  return (
    <style>{`
      @media print {
        #root { display: none !important; }
        /* Portrait by default: every page of the player report (cover,
           score page, Udviklingsplan) wants portrait now. The named-page
           routing below (.print-plan / .print-overview) is a Chromium-only
           feature — Safari (and so every iOS browser, since Apple requires
           them all to use its engine) ignores it and always falls back to
           this unnamed @page, so the fallback needs to already be correct
           for the common case rather than leaving it as the old landscape
           default. Position-overview printing (see .print-overview) is the
           one remaining page that actually wants landscape. */
        @page { size: A4 portrait; margin: 16mm; }
        @page plan-page { size: A4 portrait; margin: 16mm; }
        .print-plan { page: plan-page; }
        @page overview-page { size: A4 landscape; margin: 10mm; }
        .print-overview { page: overview-page; }
      }
      @media screen {
        .print-report { display: none; }
      }
      .rp-content { font-size: 14px; line-height: 1.55; }
      .rp-content h1, .rp-content h2, .rp-content h3, .rp-content h4 { margin: 14px 0 6px; }
      .rp-content h1 { font-size: 18px; }
      .rp-content h2 { font-size: 16px; }
      .rp-content h3, .rp-content h4 { font-size: 14px; }
      .rp-content p { margin: 0 0 8px; }
      .rp-content ul, .rp-content ol { margin: 0 0 8px; padding-left: 20px; }
      .rp-content blockquote {
        margin: 0 0 8px; padding-left: 12px; border-left: 3px solid #D9D4C7; color: #6B6B6B;
      }
      @media print {
        .rp-content h1, .rp-content h2, .rp-content h3, .rp-content h4 { margin: 10px 0 5px; }
        .rp-content h1 { font-size: 15pt; }
        .rp-content h2 { font-size: 13pt; }
        .rp-content h3, .rp-content h4 { font-size: 12pt; }
        .rp-content p, .rp-content ul, .rp-content ol { margin: 0 0 6px; }
      }
    `}</style>
  );
}

function buildPositionGroups(data) {
  return POSITION_CATALOG.map(({ id }) => {
    const rows = data.players
      .filter((p) => p.primaryPosition === id || p.secondaryPosition === id)
      .map((p) => {
        const latestPeriod = getLatestScoredPeriod(data, p.id);
        const scores = latestPeriod ? getPlayerScores(data, p.id, latestPeriod.id) : {};
        const overall = overallAverage(data.config, scores, p);
        return { player: p, overall };
      })
      .sort((a, b) => (b.overall ?? -Infinity) - (a.overall ?? -Infinity));
    return { pos: id, rows };
  });
}

function PositionOverviewPrint({ data }) {
  const positionGroups = buildPositionGroups(data);

  return (
    <div className="print-report print-overview" style={pstyles.page}>
      <div style={pstyles.headRow}>
        <img src={LOGO_SRC} alt="Klublogo" style={pstyles.logo} />
        <div>
          <div style={pstyles.title}>Positionsoversigt</div>
          <div style={pstyles.subtitle}>
            Spillere rangeret efter seneste samlede score pr. position
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {positionGroups.map(({ pos, rows }) => (
          <div key={pos} style={pstyles.categoryCell}>
            <div style={{ ...pstyles.categoryHead, background: "#1A1A1A" }}>Position {pos}</div>
            <div style={{ padding: "4px 6px" }}>
              {rows.length === 0 ? (
                <div style={{ fontSize: "7.5pt", color: "#6B6B6B", fontStyle: "italic" }}>
                  Ingen spillere
                </div>
              ) : (
                <ol style={{ margin: 0, paddingLeft: 14 }}>
                  {rows.map(({ player, overall }) => (
                    <li key={player.id} style={{ fontSize: "7.5pt", marginBottom: 2 }}>
                      <span style={!player.secondaryPosition ? { fontWeight: 700 } : undefined}>
                        {player.name}
                      </span>{" "}
                      <span style={{ color: "#6B6B6B" }}>
                        ({overall != null ? overall.toFixed(1) : "—"})
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PositionOverviewView({ data }) {
  const positionGroups = buildPositionGroups(data);

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Positionsoversigt</h1>
          <p style={styles.subtext}>
            Hver spiller vist under sin primære og evt. sekundære position — rangeret efter
            seneste samlede score. Spillere med både primær og sekundær position optræder to
            gange. Spillere der kun har én position er vist med <strong>fed skrift</strong>.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => window.print()}>
          <Printer size={16} /> Generér PDF
        </button>
      </div>

      <div style={styles.grid}>
        {positionGroups.map(({ pos, rows }) => (
          <div key={pos} style={styles.categoryBlock}>
            <div style={styles.categoryLabel}>Position {pos}</div>
            {rows.length === 0 ? (
              <p style={{ ...styles.subtext, fontStyle: "italic", marginTop: 8 }}>
                Ingen spillere
              </p>
            ) : (
              <ol style={{ margin: "10px 0 0", paddingLeft: 18 }}>
                {rows.map(({ player, overall }) => (
                  <li key={player.id} style={{ fontSize: 14, marginBottom: 6 }}>
                    <span style={!player.secondaryPosition ? { fontWeight: 700 } : undefined}>
                      {player.name}
                    </span>{" "}
                    <span style={{ color: "#8A8A8A" }}>
                      ({overall != null ? overall.toFixed(1) : "—"})
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>

      {createPortal(<PositionOverviewPrint data={data} />, document.body)}
    </div>
  );
}

// First page of the printed report — logo, player name, and (if the player
// has a Trin/level assigned) that level's coach-written expectations, one
// per line in the textarea (see ParticipationLevelsView), rendered here as
// actual bullets rather than PrintableReport's run-on inline text. Shares
// the portrait .print-plan page with DevelopmentPlanPrintSection since a
// cover page reads better upright than squeezed onto the landscape grid.
function CoverPagePrint({ player, config }) {
  const level = (config.participationLevels || []).find(
    (l) => l.id === player.participationLevelId
  );
  const expectationLines = (level?.expectations || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="print-report print-plan" style={{ ...pstyles.page, width: "178mm" }}>
      <div style={pstyles.coverWrap}>
        <div style={pstyles.coverHeadline}>Spillerudvikling</div>
        <img src={LOGO_SRC} alt="Klublogo" style={pstyles.coverLogo} />
        <div style={pstyles.coverName}>{player.name}</div>
        {level && (
          <div style={pstyles.coverLevelBox}>
            <div style={pstyles.coverLevelLabel}>Trin</div>
            <div style={pstyles.coverLevelName}>{level.name}</div>
            {expectationLines.length > 0 && (
              <ul style={pstyles.coverList}>
                {expectationLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Keeps the original 2x2 category grid but reflows it to the narrower
// portrait width (see .print-plan in PrintStyles) instead of keeping the
// 277mm landscape footprint and rotating it onto the page. An earlier
// version did rotate it (position:absolute + transform:rotate, anchored to
// the page's own @page-per-section via the CSS `page` property) to avoid
// reflowing at all — that reproduced the exact original landscape page,
// but both the named-@page routing and the rotate-via-absolute-positioning
// page-break both only work in Chromium. iOS (Safari's engine, which is
// what every iOS browser — Chrome included — is built on by Apple's
// policy) ignores the named page and doesn't break pages around absolutely
// positioned content, so the two pages overlaid on top of each other.
// Reflowing in normal document flow has no such engine dependency.
function PrintableReport({ player, teamName, config, goals, colA, colB }) {
  return (
    <div
      className="print-report print-plan"
      style={{ ...pstyles.page, width: "178mm", pageBreakBefore: "always" }}
    >
      <div style={pstyles.headRow}>
        <img src={LOGO_SRC} alt="Klublogo" style={pstyles.logo} />
        <div>
          <div style={pstyles.title}>
            Spillerprofil {player.name}
            {formatPlayerPositions(player) ? ` — ${formatPlayerPositions(player)}` : ""}
          </div>
          {teamName && <div style={pstyles.subtitle}>{teamName}</div>}
        </div>
      </div>

      {(() => {
        const categoryData = CATEGORY_META.map((cat) => {
          const skills = categorySkillsForPlayer(config, player, cat.key);
          const totA = categoryTotal(config, colA.scores, cat.key, player);
          const totB = categoryTotal(config, colB.scores, cat.key, player);
          const catRadarData = skills.map((s) => ({
            subject: s.name,
            colA: colA.scores[s.id] ?? 0,
            colB: colB.scores[s.id] ?? 0,
          }));
          return { ...cat, skills, totA, totB, catRadarData };
        });

        return (
          <>
            <div style={pstyles.radarGrid}>
              {categoryData.map((cat) => (
                <div key={cat.key} style={pstyles.radarCell}>
                  <div style={{ ...pstyles.categoryHead, background: cat.accent }}>
                    {cat.label}
                  </div>
                  {cat.skills.length > 0 && (
                    <div style={pstyles.barList}>
                      {cat.skills.map((s) => {
                        const nu = colA.scores[s.id];
                        const mal = colB.scores[s.id];
                        return (
                          <div key={s.id} style={pstyles.barRow}>
                            <div style={{ ...pstyles.barLabel, color: cat.accent }}>
                              {s.name}
                            </div>
                            <div style={pstyles.barTrack}>
                              <div
                                style={{
                                  ...pstyles.barFill,
                                  width: `${((nu || 0) / 5) * 100}%`,
                                  background: cat.accent,
                                }}
                              />
                              {mal != null && (
                                <div
                                  style={{
                                    ...pstyles.barTick,
                                    left: `${(mal / 5) * 100}%`,
                                  }}
                                />
                              )}
                            </div>
                            <div style={pstyles.barValue}>
                              Nu: {nu ?? "–"}
                              {mal != null ? `  Mål: ${mal}` : ""}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={pstyles.grid}>
              {categoryData.map((cat) => (
                <div key={cat.key} style={pstyles.categoryCell}>
                  <div style={{ ...pstyles.categoryHead, background: cat.accent }}>
                    {cat.label}
                  </div>
                  <div style={pstyles.categoryBody}>
                    <table style={pstyles.table}>
                      <thead>
                        <tr>
                          <th style={{ ...pstyles.th, ...pstyles.thName }}></th>
                          <th style={pstyles.th}>{colA.label}</th>
                          <th style={pstyles.th}>{colB.label}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.skills.map((s) => (
                          <tr key={s.id}>
                            <td style={pstyles.tdName}>{s.name}</td>
                            <td style={pstyles.td}>{colA.scores[s.id] ?? ""}</td>
                            <td style={pstyles.td}>{colB.scores[s.id] ?? ""}</td>
                          </tr>
                        ))}
                        <tr>
                          <td style={{ ...pstyles.tdName, fontWeight: 700 }}>Gennemsnit</td>
                          <td style={{ ...pstyles.td, fontWeight: 700 }}>
                            {cat.totA.avg.toFixed(2)}
                          </td>
                          {/* Not a meaningful "average goal" — only a few skills in a
                              category typically have a Mål set, so dividing the sum by
                              every skill in the category (categoryTotal's denominator)
                              produced a misleading fraction like 0.67 rather than an
                              actual average of the goals that exist. */}
                          <td style={{ ...pstyles.td, fontWeight: 700 }}></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      })()}

      <div style={pstyles.footerRow}>
        {GOAL_HORIZON_FIELDS.some((f) => player[f.key]) && (
          <div style={pstyles.horizonRow}>
            {GOAL_HORIZON_FIELDS.filter((f) => player[f.key]).map((f) => (
              <div key={f.key} style={pstyles.horizonCell}>
                <div style={pstyles.horizonLabel}>{f.label}</div>
                <div>{player[f.key]}</div>
              </div>
            ))}
          </div>
        )}

        {Object.keys(goals).length > 0 && (
          <div style={pstyles.goalsBox}>
            <div style={pstyles.goalsTitle}>Udviklingsmål</div>
            {Object.keys(goals).map((skillId) => {
              const meta = findSkillMeta(config, skillId);
              if (!meta) return null;
              const goal = goals[skillId];
              return (
                <div key={skillId} style={pstyles.goalLine}>
                  <strong>{meta.skill.name}</strong> — Mål: {goal.target}
                  {goal.note ? ` — Målsætning: ${goal.note}` : ""}
                  {goal.focusAreas ? ` — Fokusområder: ${goal.focusAreas}` : ""}
                  {goal.progressLog && goal.progressLog.length > 0 ? (
                    <>
                      <br />
                      Selvevalueringer: {formatProgressLog(goal.progressLog.slice(-4))}
                    </>
                  ) : typeof goal.progress === "number" ? (
                    ` — Fremskridt: ${goal.progress}/10`
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const pstyles = {
  page: {
    width: "277mm",
    fontFamily: "Arial, sans-serif",
    color: "#111111",
    fontSize: "8pt",
  },
  headRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    borderBottom: "2px solid #111111",
    paddingBottom: 5,
  },
  logo: { width: 30, height: 30, objectFit: "contain" },
  title: { fontSize: "12pt", fontWeight: 700 },
  subtitle: { fontSize: "8.5pt", color: "#4A4A4A" },
  horizonRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  horizonCell: {
    flex: 1,
    border: "1px solid #B0B0B0",
    padding: "4px 6px",
    fontSize: "7.5pt",
  },
  horizonLabel: {
    fontWeight: 700,
    fontSize: "7pt",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  radarGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 8,
  },
  radarCell: {
    border: "1px solid #111111",
    display: "flex",
    flexDirection: "column",
    padding: "3px 6px 6px",
  },
  barList: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    marginTop: 2,
  },
  barRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  barLabel: {
    width: "32%",
    fontWeight: 700,
    fontSize: "6.5pt",
    lineHeight: 1.15,
  },
  barTrack: {
    position: "relative",
    flex: 1,
    height: 6,
    background: "#E5E5E5",
    borderRadius: 3,
  },
  barFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: 3,
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  },
  // Centered on the Mål value via translateX, and taller than the track
  // itself so it visibly pokes out above/below the bar like a target
  // marker rather than blending into it.
  barTick: {
    position: "absolute",
    top: -2,
    width: 2,
    height: 10,
    background: "#111111",
    transform: "translateX(-1px)",
  },
  barValue: {
    width: "26%",
    textAlign: "right",
    fontSize: "6.5pt",
    color: "#4A4A4A",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 8,
  },
  categoryCell: {
    border: "1px solid #111111",
  },
  categoryHead: {
    padding: "3px 6px",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "8pt",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  },
  categoryBody: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 4px",
  },
  table: {
    flex: 1,
    width: "100%",
    tableLayout: "fixed",
    borderCollapse: "collapse",
  },
  th: {
    border: "1px solid #111111",
    padding: "2px 4px",
    color: "#FFFFFF",
    background: "#1A1A1A",
    fontSize: "7pt",
    textAlign: "center",
    width: "22.5%",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  },
  // table-layout:fixed sizes columns off the FIRST row's widths, so this
  // (spread onto the header row's blank first <th>) is what actually fixes
  // the name column — matching width also set on tdName below keeps body
  // rows consistent, though fixed layout wouldn't need it read from there.
  thName: { textAlign: "left", width: "55%" },
  td: {
    border: "1px solid #B0B0B0",
    padding: "2px 4px",
    textAlign: "center",
    fontSize: "7.5pt",
    width: "22.5%",
  },
  tdName: {
    border: "1px solid #B0B0B0",
    padding: "2px 4px",
    textAlign: "left",
    fontSize: "7.5pt",
    width: "55%",
  },
  footerRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    alignItems: "start",
  },
  goalsBox: {
    border: "1px solid #111111",
    padding: "6px 8px",
    fontSize: "7.5pt",
  },
  goalsTitle: { fontWeight: 700, fontSize: "13pt", marginBottom: 6 },
  goalLine: { marginBottom: 3, lineHeight: 1.35 },
  coverWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    marginTop: "35mm",
  },
  coverHeadline: {
    fontSize: "11pt",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#6B6B6B",
    marginBottom: 20,
  },
  coverLogo: { width: 64, height: 64, objectFit: "contain", marginBottom: 16 },
  coverName: { fontSize: "22pt", fontWeight: 700 },
  coverLevelBox: {
    marginTop: 28,
    width: "100%",
    maxWidth: "140mm",
    textAlign: "left",
    border: "1px solid #111111",
    borderRadius: 6,
    padding: "16px 22px",
  },
  coverLevelLabel: {
    fontSize: "9pt",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6B6B6B",
    marginBottom: 4,
  },
  coverLevelName: { fontSize: "15pt", fontWeight: 700, marginBottom: 12 },
  coverList: { margin: 0, paddingLeft: 20, fontSize: "11pt", lineHeight: 1.65 },
};

// Appended after PrintableReport in the same portal (see PlayerView and
// PlayerSelfEvalApp) so "Udskriv rapport" produces one print job covering
// both the score/goals page and the plan — on its own page via
// page-break-before, since the two are visually unrelated. Only rendered
// when hasDevelopmentPlanContent(plan) is true, so a player with no plan
// yet doesn't get a blank trailing page.
function DevelopmentPlanPrintSection({ player, plan }) {
  return (
    <div
      className="print-report print-plan"
      style={{ ...pstyles.page, width: "178mm", pageBreakBefore: "always" }}
    >
      <div style={pstyles.headRow}>
        <img src={LOGO_SRC} alt="Klublogo" style={pstyles.logo} />
        <div>
          <div style={pstyles.title}>Udviklingsplan — {player.name}</div>
          {plan.seasonLabel && <div style={pstyles.subtitle}>{plan.seasonLabel}</div>}
        </div>
      </div>

      <div
        className="rp-content"
        style={{ fontSize: "11pt", lineHeight: 1.5 }}
        dangerouslySetInnerHTML={{ __html: plan.contentHtml }}
      />
    </div>
  );
}

// Standalone "print for sig selv" — opens its own window, independent of any
// period/report-panel state, matching the pattern kpPrintPlan uses for
// kampplaner. Kept separate from DevelopmentPlanPrintSection (the samlede
// rapport variant) — that one reuses pstyles' header/layout styling and
// opts into its own portrait @page (see .print-plan in PrintStyles) rather
// than duplicating a full standalone document like this one.
// plan.contentHtml is already sanitized server-side before it's stored (see
// routes/developmentPlans.js), so it's safe to drop straight into the
// popup document here.
function printDevelopmentPlan(player, plan) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  const name = kpEscapeHtml(player.name || "");
  const season = kpEscapeHtml(plan.seasonLabel || "");

  const doc = `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="UTF-8">
<title>Udviklingsplan – ${name}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; background: #fff; font-family: Arial, sans-serif; color: #111111; }
  .dp-head { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #111111; padding-bottom: 10px; margin-bottom: 16px; }
  .dp-head img { width: 40px; height: 40px; object-fit: contain; }
  .dp-title { font-size: 20px; font-weight: 700; }
  .dp-sub { font-size: 13px; color: #4A4A4A; margin-top: 2px; }
  .dp-body { font-size: 13px; line-height: 1.55; }
  .dp-body h1, .dp-body h2, .dp-body h3, .dp-body h4 { margin: 18px 0 6px; }
  .dp-body h1 { font-size: 17px; } .dp-body h2 { font-size: 15px; } .dp-body h3, .dp-body h4 { font-size: 13.5px; }
  .dp-body p { margin: 0 0 8px; }
  .dp-body ul, .dp-body ol { margin: 0 0 8px; padding-left: 20px; }
  .dp-body blockquote { margin: 0 0 8px; padding-left: 12px; border-left: 3px solid #D9D4C7; color: #4A4A4A; }
  .print-bar { display: flex; justify-content: flex-end; margin-bottom: 14px; }
  .print-bar button {
    font-weight: 600; font-size: 13px; padding: 8px 16px; border-radius: 6px;
    border: 1.5px solid #1B4332; background: #1B4332; color: #fff; cursor: pointer;
  }
  @media print { .print-bar { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="print-bar"><button onclick="window.print()">Print</button></div>
  <div class="dp-head">
    <img src="${LOGO_SRC}" alt="Klublogo">
    <div>
      <div class="dp-title">Udviklingsplan — ${name}</div>
      ${season ? `<div class="dp-sub">${season}</div>` : ""}
    </div>
  </div>
  <div class="dp-body">${plan.contentHtml || ""}</div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(doc);
  printWindow.document.close();
  printWindow.focus();
  return true;
}

function CompareView({ config, periods, evaluations, player }) {
  const [fromId, setFromId] = useState(periods[0].id);
  const [toId, setToId] = useState(periods[periods.length - 1].id);

  const fromScores = evaluations[fromId]?.scores || {};
  const toScores = evaluations[toId]?.scores || {};
  const fromPeriod = periods.find((p) => p.id === fromId);
  const toPeriod = periods.find((p) => p.id === toId);

  const radarData = CATEGORY_META.map((c) => ({
    subject: c.short,
    from: categoryAverage(config, fromScores, c.key, player) || 0,
    to: categoryAverage(config, toScores, c.key, player) || 0,
  }));

  const overallFrom = overallAverage(config, fromScores, player);
  const overallTo = overallAverage(config, toScores, player);
  const overallDelta =
    overallFrom != null && overallTo != null ? overallTo - overallFrom : null;

  return (
    <div>
      <div style={styles.compareSelectRow}>
        <div style={{ flex: 1 }}>
          <div style={styles.fieldLabel}>Fra</div>
          <select style={styles.select} value={fromId} onChange={(e) => setFromId(e.target.value)}>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} · {formatDate(p.date)}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.fieldLabel}>Til</div>
          <select style={styles.select} value={toId} onChange={(e) => setToId(e.target.value)}>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} · {formatDate(p.date)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.radarCard}>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData} outerRadius="65%">
            <PolarGrid stroke="#D9D4C7" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#1A1A1A", fontSize: 12, fontFamily: "'Oswald', sans-serif" }}
            />
            <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
            <Radar
              name={fromPeriod ? fromPeriod.label : "Fra"}
              dataKey="from"
              stroke={EVAL_COLORS[0]}
              fill={EVAL_COLORS[0]}
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Radar
              name={toPeriod ? toPeriod.label : "Til"}
              dataKey="to"
              stroke={EVAL_COLORS[1]}
              fill={EVAL_COLORS[1]}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.overallCompareCard}>
        <div>
          <div style={styles.fieldLabel}>Samlet</div>
          <div style={styles.overallCompareNums}>
            <span>{overallFrom != null ? overallFrom.toFixed(1) : "—"}</span>
            <span style={{ color: "#B9B2A0" }}>→</span>
            <span>{overallTo != null ? overallTo.toFixed(1) : "—"}</span>
          </div>
        </div>
        <DeltaBadge value={overallDelta} />
      </div>

      {CATEGORY_META.map((cat) => {
        const fromAvg = categoryAverage(config, fromScores, cat.key, player);
        const toAvg = categoryAverage(config, toScores, cat.key, player);
        const delta = fromAvg != null && toAvg != null ? toAvg - fromAvg : null;
        const skills = categorySkillsForPlayer(config, player, cat.key);
        return (
          <div key={cat.key} style={styles.categoryBlock}>
            <div style={styles.categoryHeadRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ ...styles.dot, background: cat.accent }} />
                <span style={styles.categoryLabel}>{cat.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={styles.compareNums}>
                  {fromAvg != null ? fromAvg.toFixed(1) : "—"} → {toAvg != null ? toAvg.toFixed(1) : "—"}
                </span>
                <DeltaBadge value={delta} compact />
              </div>
            </div>
            {skills.map((skill) => {
              const fv = fromScores[skill.id];
              const tv = toScores[skill.id];
              const d = typeof fv === "number" && typeof tv === "number" ? tv - fv : null;
              return (
                <div key={skill.id} style={styles.skillRow}>
                  <span style={styles.skillName}>{skill.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={styles.compareNums}>
                      {fv ?? "—"} → {tv ?? "—"}
                    </span>
                    <DeltaBadge value={d} compact />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function DeltaBadge({ value, compact }) {
  if (value == null) {
    return <span style={{ ...styles.deltaBadge, ...styles.deltaNeutral }}>—</span>;
  }
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) {
    return (
      <span style={{ ...styles.deltaBadge, ...styles.deltaNeutral }}>
        <Minus size={compact ? 10 : 12} /> 0
      </span>
    );
  }
  const up = rounded > 0;
  return (
    <span style={{ ...styles.deltaBadge, ...(up ? styles.deltaUp : styles.deltaDown) }}>
      {up ? <ArrowUp size={compact ? 10 : 12} /> : <ArrowDown size={compact ? 10 : 12} />}
      {up ? "+" : ""}
      {rounded}
    </span>
  );
}

function SettingsView({
  config,
  onRename,
  onToggle,
  onCreateSkill,
  onAddSkillToGroup,
  onRemoveSkillFromGroup,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
}) {
  const [editing, setEditing] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [addingSkillFor, setAddingSkillFor] = useState(null);
  const [newSkillName, setNewSkillName] = useState("");

  const groups = [...(config.groups || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const submitNewGroup = async () => {
    if (!newGroupName.trim()) return;
    await onCreateGroup(newGroupName.trim());
    setNewGroupName("");
    setAddingGroup(false);
  };

  const submitNewSkill = async (catKey) => {
    if (!newSkillName.trim()) return;
    await onCreateSkill(catKey, null, newSkillName.trim());
    setNewSkillName("");
    setAddingSkillFor(null);
  };

  const toggleMembership = (catKey, skill, groupId) => {
    if (skill.groupIds.includes(groupId)) {
      onRemoveSkillFromGroup(catKey, skill.id, groupId);
    } else {
      onAddSkillToGroup(catKey, skill.id, groupId);
    }
  };

  return (
    <div>
      <h1 style={styles.h1}>Vurderingskriterier</h1>
      <p style={styles.subtext}>
        Omdøb kriterier, eller deaktivér dem, jeres klub ikke bruger. Deaktiverede kriterier
        udgår af alle spilleres kategori-gennemsnit.
      </p>

      <div style={styles.categoryBlock}>
        <div style={styles.categoryHeadRow}>
          <span style={styles.categoryLabel}>Kriteriegrupper</span>
          <button
            style={styles.iconBtn}
            title="Ny gruppe"
            onClick={() => {
              setAddingGroup(true);
              setNewGroupName("");
            }}
          >
            <Plus size={14} />
          </button>
        </div>
        <p style={styles.subtext}>
          Hver spiller tilhører præcis én gruppe. Et kriterie kan indgå i flere grupper — fx kan
          Fysisk-kriterier gælde for både Standard og Målmand, mens kun Målmand har
          målmandsspecifikke Teknik-kriterier.
        </p>

        {addingGroup && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              style={styles.input}
              placeholder="Gruppenavn (fx Målmand)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
            />
            <button style={styles.primaryBtnSm} onClick={submitNewGroup}>
              Opret
            </button>
            <button style={styles.ghostBtn} onClick={() => setAddingGroup(false)}>
              Annuller
            </button>
          </div>
        )}

        {groups.length === 0 && !addingGroup && (
          <div style={styles.noSkills}>Ingen grupper endnu — opret mindst én.</div>
        )}

        {groups.map((group) => (
          <div key={group.id} style={styles.settingsRow}>
            {editingGroup === group.id ? (
              <input
                style={styles.editInput}
                defaultValue={group.name}
                autoFocus
                onBlur={(e) => {
                  onRenameGroup(group.id, e.target.value.trim() || group.name);
                  setEditingGroup(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.target.blur();
                  if (e.key === "Escape") setEditingGroup(null);
                }}
              />
            ) : (
              <span style={styles.skillName}>{group.name}</span>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              <button style={styles.iconBtn} onClick={() => setEditingGroup(group.id)} title="Omdøb">
                <Pencil size={14} />
              </button>
              <button
                style={{ ...styles.iconBtn, color: "#E2231A" }}
                onClick={() => onDeleteGroup(group.id)}
                title="Slet gruppe"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {CATEGORY_META.map((cat) => (
        <div key={cat.key} style={styles.categoryBlock}>
          <div style={styles.categoryHeadRow}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ ...styles.dot, background: cat.accent }} />
              <span style={styles.categoryLabel}>{cat.label}</span>
            </div>
            <button
              style={styles.iconBtn}
              title="Nyt kriterium"
              onClick={() => {
                setAddingSkillFor(cat.key);
                setNewSkillName("");
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          {addingSkillFor === cat.key && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                style={styles.input}
                placeholder="Kriterienavn"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                autoFocus
              />
              <button style={styles.primaryBtnSm} onClick={() => submitNewSkill(cat.key)}>
                Opret
              </button>
              <button style={styles.ghostBtn} onClick={() => setAddingSkillFor(null)}>
                Annuller
              </button>
            </div>
          )}

          {config[cat.key].map((skill) => (
            <div key={skill.id} style={styles.settingsRow}>
              {editing === skill.id ? (
                <input
                  style={styles.editInput}
                  defaultValue={skill.name}
                  autoFocus
                  onBlur={(e) => {
                    onRename(cat.key, skill.id, e.target.value.trim() || skill.name);
                    setEditing(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.target.blur();
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
              ) : (
                <span
                  style={{
                    ...styles.skillName,
                    opacity: skill.enabled ? 1 : 0.4,
                    textDecoration: skill.enabled ? "none" : "line-through",
                  }}
                >
                  {skill.name}
                </span>
              )}
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {groups.map((g) => (
                  <button
                    key={g.id}
                    style={{
                      ...styles.groupChip,
                      ...(skill.groupIds.includes(g.id) ? styles.groupChipActive : {}),
                    }}
                    onClick={() => toggleMembership(cat.key, skill, g.id)}
                    title={
                      skill.groupIds.includes(g.id) ? `Fjern fra ${g.name}` : `Tilføj til ${g.name}`
                    }
                  >
                    {g.name}
                  </button>
                ))}
                <button style={styles.iconBtn} onClick={() => setEditing(skill.id)} title="Omdøb">
                  <Pencil size={14} />
                </button>
                <button
                  style={styles.iconBtn}
                  onClick={() => onToggle(cat.key, skill.id)}
                  title={skill.enabled ? "Deaktiver" : "Aktiver"}
                >
                  {skill.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Kampplan (match plan) — a self-contained tactical planning tool,
   ported from a standalone prototype. Kept visually distinct (dark
   pitch theme) from the rest of the app on purpose, scoped under
   .kampplan-app so it can't leak into the rest of the UI, which is
   styled entirely with inline styles.
   ============================================================ */

const KP_DEFENSE_CATEGORIES = [
  "Forsvar feltet",
  "Organiseret forsvarsspil",
  "Genopret balance",
  "Reoganisering efter boldtab",
];
const KP_CONQUEST_CATEGORIES = ["Genpres", "Højt pres", "Pres fra organiseret forsvarsspil"];
const KP_BUILDUP_CATEGORIES = [
  "Fastholde bolden efter erobring",
  "Mod højt pres",
  "Mod organiseret forsvarsspil",
];
const KP_FINISHING_CATEGORIES = ["Kontrangreb", "Forbi højt pres", "Gennembrud", "Afslutning af angreb"];
const KP_EXTRAS_CATEGORIES = ["Preshøjde", "Hjørnespark højre", "Hjørnespark venstre", "Frispark"];

const KAMPPLAN_DIVISIONS = ["Division", "Liga 1", "Liga 2"];
// How much a game's kampscore counts toward a player's weighted average
// (see PlayerStatsView) — a higher level should count for more. Plans
// with no række set (or an older plan from before this field existed) fall
// back to the neutral Liga 1 weight.
const KAMPPLAN_DIVISION_WEIGHTS = { Division: 1.2, "Liga 1": 1, "Liga 2": 0.8 };

function kpEmptyPlan() {
  return {
    id: null,
    division: "",
    opponent: "",
    date: todayStr(),
    teamGoals: [""],
    defense: [],
    conquest: [],
    buildUp: [],
    finishing: [],
    extras: [],
    generalNotes: "",
    playerGoals: {},
    playerGoalNotes: {},
    positions: [],
    formation: "",
    positions2: [],
    formation2: "",
    reserves: [],
    performanceScores: {},
    shareToken: null,
  };
}

function kpFmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// For the share-link card's "aktivt til og med" note — matches the
// expiry server/routes/matchPlanShare.js actually enforces (through the
// day after match_date).
function kpAddDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function kpEscapeHtml(str) {
  return String(str).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Renders free-text notes as safe HTML: escapes everything, then turns any
// URL-looking substrings into real clickable links. Never accepts arbitrary
// HTML from the user — only <a> and <br> are ever produced.
function kpLinkify(text) {
  const escaped = kpEscapeHtml(text || "");
  const withLinks = escaped.replace(/((https?:\/\/|www\.)[^\s<]+)/gi, (match) => {
    const href = match.toLowerCase().startsWith("http") ? match : `https://${match}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });
  return withLinks.replace(/\n/g, "<br/>");
}

const KP_PRINT_CSS = `
.pp-page{ font-family:var(--font-body);color:#111;font-size:13.5px;line-height:1.32; }
.pp-head{
  font-family:var(--font-display);font-weight:600;font-size:19px;border-bottom:2px solid #111;
  padding-bottom:5px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:baseline;
}
.pp-head span.small{font-family:var(--font-body);font-weight:600;font-size:14px;}
.pp-grid{
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  grid-template-areas:
    "goalhead goalhead goalhead"
    "goalA goalB goalC"
    "colA colB colExtra";
  gap:0 16px;
}
.pp-grid2{
  display:grid;
  grid-template-columns:2fr 1fr 1fr;
  grid-template-areas:
    "goals lineup1 lineup2";
  gap:0 16px;
}
.pp-page2{ page-break-before:always; break-before:page; }
.pp-colA{grid-area:colA;border-right:1px solid #ccc;padding-right:14px;}
.pp-colB{grid-area:colB;border-right:1px solid #ccc;padding-right:14px;}
.pp-colExtra{grid-area:colExtra;}
.pp-goals{grid-area:goals;border-right:1px solid #ccc;padding-right:14px;border-top:1px solid #ccc;margin-top:8px;padding-top:6px;}
.pp-lineup1{grid-area:lineup1;border-right:1px solid #ccc;padding-right:14px;border-top:1px solid #ccc;margin-top:8px;padding-top:6px;}
.pp-lineup2{grid-area:lineup2;border-top:1px solid #ccc;margin-top:8px;padding-top:6px;}
.pp-goalhead{grid-area:goalhead;}
.pp-goalhead h4{
  font-family:var(--font-display);font-size:12.5px;text-transform:uppercase;letter-spacing:.03em;
  margin:0 0 3px;padding-bottom:0;border:none;
}
.pp-goalA{grid-area:goalA;border-right:1px solid #ccc;padding-right:14px;border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:12px;}
.pp-goalB{grid-area:goalB;border-right:1px solid #ccc;padding-right:14px;border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:12px;}
.pp-goalC{grid-area:goalC;border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:12px;}
.pp-goal-list{margin:0;padding:0;list-style:none;}
.pp-goal-list li{margin:0 0 2px;}
.pp-block{margin-bottom:5px;}
.pp-block h4{
  font-family:var(--font-display);font-size:12.5px;text-transform:uppercase;letter-spacing:.03em;
  margin:0 0 3px;border-bottom:1px solid #999;padding-bottom:2px;
}
.pp-phase-header{
  font-family:var(--font-display);font-weight:700;font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;
  background:#eee;border:1px solid #bbb;border-radius:3px;padding:3px 6px;margin-bottom:4px;
}
.pp-block p, .pp-goalA p, .pp-goalB p, .pp-goalC p{margin:0 0 2px;white-space:pre-line;}
.pp-block p b{font-weight:700;}
.pp-notes-text{white-space:pre-line;margin:0;}
.pp-table{width:100%;border-collapse:collapse;margin-bottom:4px;}
.pp-table th, .pp-table td{border:1px solid #bbb;padding:2px 5px;text-align:left;font-size:12.5px;line-height:1.25;}
.pp-table th{background:#eee;font-weight:700;}
`;

function kpPline(label, value) {
  if (!value) return `<p><b>${label}:</b></p>`;
  return `<p><b>${label}:</b> ${kpEscapeHtml(value)}</p>`;
}

function kpPrintPlan(p) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    return false;
  }

  const rosterSorted = [...p.positions]
    .filter((r) => r.name && r.name.trim())
    .sort((a, b) => Number(a.position) - Number(b.position));
  const rosterNamesUnique = [...new Set(rosterSorted.map((r) => r.name.trim()))];
  // Individuelle mål covers reserves too (see KampplanEditor) — a reserve
  // can still come on, so her goal needs to print as well.
  const reserveNamesUnique = [
    ...new Set(
      (p.reserves || [])
        .map((r) => (typeof r === "string" ? r : r.name))
        .map((n) => n && n.trim())
        .filter(Boolean)
    ),
  ];
  const goalNamesUnique = [...rosterNamesUnique, ...reserveNamesUnique.filter((n) => !rosterNamesUnique.includes(n))];
  const goalsRows =
    goalNamesUnique
      .map((name) => {
        const posForName = rosterSorted.find((r) => r.name.trim() === name);
        return `<tr><td>${kpEscapeHtml(posForName ? posForName.position : "Res.")}</td><td>${kpEscapeHtml(
          name
        )}</td><td>${kpEscapeHtml(p.playerGoals[name] || "")}${
          p.playerGoals[name] && (p.playerGoalNotes || {})[name]
            ? "<br>" + kpEscapeHtml(p.playerGoalNotes[name]).replace(/\n/g, "<br>")
            : ""
        }</td></tr>`;
      })
      .join("") || '<tr><td colspan="3">–</td></tr>';
  const posRows =
    [...p.positions]
      .sort((a, b) => Number(a.position) - Number(b.position))
      .map((r) => `<tr><td>${kpEscapeHtml(r.position)}</td><td>${kpEscapeHtml(r.name)}</td></tr>`)
      .join("") || '<tr><td colspan="2">–</td></tr>';
  const posRows2 =
    [...p.positions2]
      .sort((a, b) => Number(a.position) - Number(b.position))
      .map((r) => `<tr><td>${kpEscapeHtml(r.position)}</td><td>${kpEscapeHtml(r.name)}</td></tr>`)
      .join("") || '<tr><td colspan="2">–</td></tr>';
  const reserveRows =
    (p.reserves || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((name) => `<tr><td>${kpEscapeHtml(name)}</td></tr>`)
      .join("") || '<tr><td>–</td></tr>';
  const filledGoals = p.teamGoals.filter(Boolean);
  const goalCols = [[], [], []];
  filledGoals.forEach((g, i) => goalCols[i % 3].push(g));
  const renderGoalCol = (list) =>
    list.length
      ? `<ul class="pp-goal-list">${list.map((g) => `<li>${kpEscapeHtml(g)}</li>`).join("")}</ul>`
      : "";

  const markup = `
    <div class="pp-page">
      <div class="pp-head">
        <span>${kpEscapeHtml(p.opponent || "–")}</span>
        <span class="small">${kpFmtDate(p.date)}</span>
      </div>

      <div class="pp-grid">
        <div class="pp-goalhead">
          <h4>Målsætning for holdet</h4>
          ${filledGoals.length ? "" : "<p>–</p>"}
        </div>

        ${
          filledGoals.length
            ? `
        <div class="pp-goalA">${renderGoalCol(goalCols[0])}</div>
        <div class="pp-goalB">${renderGoalCol(goalCols[1])}</div>
        <div class="pp-goalC">${renderGoalCol(goalCols[2])}</div>
        `
            : ""
        }

        <div class="pp-colA">
          <div class="pp-phase-header">Vi har bolden</div>
          <div class="pp-block">
            <h4>Opbygningsspil</h4>
            ${
              p.buildUp.filter((b) => b.text).length
                ? p.buildUp.filter((b) => b.text).map((b) => kpPline(b.category, b.text)).join("")
                : "<p>–</p>"
            }
          </div>
          <div class="pp-block">
            <h4>Afslutningsspil</h4>
            ${
              p.finishing.filter((f) => f.text).length
                ? p.finishing.filter((f) => f.text).map((f) => kpPline(f.category, f.text)).join("")
                : "<p>–</p>"
            }
          </div>
        </div>

        <div class="pp-colB">
          <div class="pp-phase-header">Når de har bolden</div>
          <div class="pp-block">
            <h4>Forsvarsspil</h4>
            ${
              p.defense.filter((d) => d.text).length
                ? p.defense.filter((d) => d.text).map((d) => kpPline(d.category, d.text)).join("")
                : "<p>–</p>"
            }
          </div>
          <div class="pp-block">
            <h4>Erobringsspil</h4>
            ${
              p.conquest.filter((c) => c.text).length
                ? p.conquest.filter((c) => c.text).map((c) => kpPline(c.category, c.text)).join("")
                : "<p>–</p>"
            }
          </div>
        </div>

        <div class="pp-colExtra">
          <div class="pp-block">
            <h4>Yderligere aftaler</h4>
            ${
              p.extras.filter((x) => x.text).length
                ? p.extras.filter((x) => x.text).map((x) => kpPline(x.category, x.text)).join("")
                : "<p>–</p>"
            }
          </div>
          <div class="pp-block">
            <h4>Noter generelt før kamp</h4>
            <p class="pp-notes-text">${p.generalNotes ? kpLinkify(p.generalNotes) : "–"}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="pp-page pp-page2">
      <div class="pp-grid2">
        <div class="pp-goals">
          <div class="pp-block">
            <h4>Individuelle mål</h4>
            <table class="pp-table">
              <thead><tr><th>Pos</th><th>Navn</th><th>Mål</th></tr></thead>
              <tbody>${goalsRows}</tbody>
            </table>
          </div>
        </div>

        <div class="pp-lineup1">
          <div class="pp-block">
            <h4>Position &amp; opstilling</h4>
            ${p.formation ? `<p><b>Formation:</b> ${kpEscapeHtml(p.formation)}</p>` : ""}
            <table class="pp-table">
              <thead><tr><th>Pos</th><th>Spiller</th></tr></thead>
              <tbody>${posRows}</tbody>
            </table>
          </div>
          <div class="pp-block">
            <h4>Reserver</h4>
            <table class="pp-table">
              <thead><tr><th>Spiller</th></tr></thead>
              <tbody>${reserveRows}</tbody>
            </table>
          </div>
        </div>

        <div class="pp-lineup2">
          <div class="pp-block">
            <h4>Position &amp; opstilling 2</h4>
            ${p.formation2 ? `<p><b>Formation:</b> ${kpEscapeHtml(p.formation2)}</p>` : ""}
            <table class="pp-table">
              <thead><tr><th>Pos</th><th>Spiller</th></tr></thead>
              <tbody>${posRows2}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  const doc = `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="UTF-8">
<title>Kampplan – ${kpEscapeHtml(p.opponent || "Uden navn")}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
@page{ size:A4 landscape; margin:9mm; }
*{box-sizing:border-box;}
body{margin:0;padding:14px;background:#fff;}
:root{ --font-display:'Oswald','Arial Narrow',sans-serif; --font-body:'Inter',-apple-system,sans-serif; }
${KP_PRINT_CSS}
.print-bar{display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px;}
.print-bar button{
  font-family:var(--font-body);font-weight:600;font-size:13px;padding:8px 16px;border-radius:6px;
  border:1.5px solid #1B4332;background:#1B4332;color:#fff;cursor:pointer;
}
@media print{ .print-bar{display:none;} body{padding:0;} }
</style>
</head>
<body>
  <div class="print-bar"><button onclick="window.print()">Print</button></div>
  ${markup}
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(doc);
  printWindow.document.close();
  printWindow.focus();
  return true;
}

function kpSetAt(list, index, patch) {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}
function kpRemoveAt(list, index) {
  return list.filter((_, i) => i !== index);
}
function kpSetStringAt(list, index, value) {
  return list.map((v, i) => (i === index ? value : v));
}

// A textarea that grows to show all of its text, so a coach never has to
// scroll inside the box to read what they wrote. The Kampplan sections start
// collapsed (display: none, where scrollHeight is 0), and the width changes
// on rotate/resize — both change how the text wraps — so it re-fits from a
// ResizeObserver as well as on every edit.
function AutoTextarea({ value, style, ...rest }) {
  const ref = React.useRef(null);
  const fit = React.useCallback(() => {
    const el = ref.current;
    if (!el || el.clientWidth === 0) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`;
  }, []);
  React.useLayoutEffect(fit, [value, fit]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    let lastWidth = el.clientWidth;
    const ro = new ResizeObserver(() => {
      // Only a width change re-wraps the text; reacting to our own height
      // change would loop.
      if (el.clientWidth !== lastWidth) {
        lastWidth = el.clientWidth;
        fit();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);
  return <textarea ref={ref} value={value} style={{ ...style, resize: "none", overflow: "hidden" }} {...rest} />;
}

// Starts collapsed, same as the category blocks on Spillertrup (see
// PlayerView's expandedCats) — the count on the right (visible whether
// collapsed or not) is what lets a coach see how much is already filled in
// without opening it.
function KpCategorySection({ title, items, categories, defaultCategory, onAdd, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={styles.categoryBlock}>
      <div
        className="category-head-row-collapsible"
        style={styles.categoryHeadRow}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.iconBtnGhost}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Skjul" : "Vis"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span style={styles.categoryLabel}>{title}</span>
        </div>
        <span style={styles.categoryAvg}>{items.length}</span>
      </div>
      <div className={`category-skills${expanded ? " category-skills-open" : ""}`}>
        {items.map((item, i) => (
          <div key={i} style={{ border: "1px solid #E3E3E3", borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <select
                style={{ ...styles.select, flex: 1 }}
                value={item.category}
                onChange={(e) => onUpdate(i, { category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button style={styles.iconBtnGhost} onClick={() => onRemove(i)} title="Fjern">
                <X size={14} />
              </button>
            </div>
            <AutoTextarea
              style={styles.textarea}
              rows={4}
              value={item.text}
              onChange={(e) => onUpdate(i, { text: e.target.value })}
            />
          </div>
        ))}
        <button
          style={{ ...styles.ghostBtn, borderStyle: "dashed", padding: "8px 14px", fontSize: 13 }}
          onClick={() => onAdd(defaultCategory)}
        >
          <Plus size={14} /> Tilføj afsnit
        </button>
      </div>
    </div>
  );
}

// Same collapsed-by-default pattern as KpCategorySection — see that
// component's comment.
function KpPositionTable({
  title,
  positions,
  formation,
  onFormationChange,
  onUpdate,
  onAdd,
  onRemove,
  playerNames,
  formations,
  reserves,
  onLineupChange,
}) {
  const [expanded, setExpanded] = useState(false);
  const layout = findFormation(formations, formation);
  const th = {
    textAlign: "left",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6B6B6B",
    padding: "0 8px 6px 0",
    fontWeight: 700,
  };
  return (
    <div style={styles.categoryBlock}>
      <div
        className="category-head-row-collapsible"
        style={styles.categoryHeadRow}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.iconBtnGhost}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Skjul" : "Vis"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span style={styles.categoryLabel}>{title}</span>
        </div>
        <span style={styles.categoryAvg}>{positions.length}</span>
      </div>
      <div className={`category-skills${expanded ? " category-skills-open" : ""}`}>
        <div style={{ maxWidth: 220, marginBottom: 14 }}>
          <div style={styles.fieldLabel}>Formation</div>
          <select
            style={styles.select}
            value={layout ? layout.name : formation || ""}
            onChange={(e) => onFormationChange(e.target.value)}
          >
            <option value="">Vælg formation</option>
            {/* A plan saved before formations were a list can carry a name
                that matches none of them — keep it selectable rather than
                silently blanking it on the next save. */}
            {formation && !layout && <option value={formation}>{formation} (ingen bane)</option>}
            {(formations || []).map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        {layout && (
          <div style={{ marginBottom: 18 }}>
            <LineupPitch
              formation={layout}
              positions={positions}
              reserves={reserves}
              playerNames={playerNames}
              onChange={onLineupChange}
            />
          </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 70 }}>Position</th>
              <th style={th}>Spillernavn</th>
              <th style={{ ...th, width: 60, textAlign: "center" }} title="Vælg fra spillerlisten frem for at skrive navnet frit">
                Liste
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {positions.map((r, i) => {
              const useList = r.useList !== false;
              return (
                <tr key={i}>
                  <td style={{ width: 70, padding: "4px 8px 4px 0" }}>
                    <select
                      style={styles.select}
                      value={r.position}
                      onChange={(e) => onUpdate(i, { position: e.target.value })}
                    >
                      {Array.from({ length: 11 }, (_, n) => n + 1).map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "4px 8px 4px 0" }}>
                    {useList ? (
                      <select
                        style={styles.select}
                        value={r.name}
                        onChange={(e) => onUpdate(i, { name: e.target.value })}
                      >
                        <option value="">Vælg spiller</option>
                        {playerNames.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        style={styles.input}
                        value={r.name}
                        placeholder="Spillernavn"
                        onChange={(e) => onUpdate(i, { name: e.target.value })}
                      />
                    )}
                  </td>
                  <td style={{ width: 60, padding: "4px 8px 4px 0", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={useList}
                      onChange={(e) => onUpdate(i, { useList: e.target.checked })}
                      title="Vælg fra spillerlisten frem for at skrive navnet frit"
                    />
                  </td>
                  <td style={{ width: 26, padding: "4px 0" }}>
                    <button style={styles.iconBtnGhost} onClick={() => onRemove(i)} title="Fjern">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          style={{ ...styles.ghostBtn, borderStyle: "dashed", padding: "8px 14px", fontSize: 13, marginTop: 10 }}
          onClick={onAdd}
        >
          <Plus size={14} /> Tilføj position
        </button>
      </div>
    </div>
  );
}

// Same collapsed-by-default pattern as KpCategorySection — see that
// component's comment.
function KpReserveTable({ reserves, onUpdate, onAdd, onRemove, playerNames }) {
  const [expanded, setExpanded] = useState(false);
  const th = {
    textAlign: "left",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6B6B6B",
    padding: "0 8px 6px 0",
    fontWeight: 700,
  };
  return (
    <div style={styles.categoryBlock}>
      <div
        className="category-head-row-collapsible"
        style={styles.categoryHeadRow}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.iconBtnGhost}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Skjul" : "Vis"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span style={styles.categoryLabel}>Reserver</span>
        </div>
        <span style={styles.categoryAvg}>{reserves.length}</span>
      </div>
      <div className={`category-skills${expanded ? " category-skills-open" : ""}`}>
        {reserves.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Spillernavn</th>
                <th style={{ ...th, width: 60, textAlign: "center" }} title="Vælg fra spillerlisten frem for at skrive navnet frit">
                  Liste
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reserves.map((r, i) => {
                const useList = r.useList !== false;
                return (
                  <tr key={i}>
                    <td style={{ padding: "4px 8px 4px 0" }}>
                      {useList ? (
                        <select
                          style={styles.select}
                          value={r.name}
                          onChange={(e) => onUpdate(i, { name: e.target.value })}
                        >
                          <option value="">Vælg spiller</option>
                          {playerNames.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          style={styles.input}
                          value={r.name}
                          placeholder="Spillernavn"
                          onChange={(e) => onUpdate(i, { name: e.target.value })}
                        />
                      )}
                    </td>
                    <td style={{ width: 60, padding: "4px 8px 4px 0", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={useList}
                        onChange={(e) => onUpdate(i, { useList: e.target.checked })}
                        title="Vælg fra spillerlisten frem for at skrive navnet frit"
                      />
                    </td>
                    <td style={{ width: 26, padding: "4px 0" }}>
                      <button style={styles.iconBtnGhost} onClick={() => onRemove(i)} title="Fjern">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <button
          style={{ ...styles.ghostBtn, borderStyle: "dashed", padding: "8px 14px", fontSize: 13, marginTop: 10 }}
          onClick={onAdd}
        >
          <Plus size={14} /> Tilføj reserve
        </button>
      </div>
    </div>
  );
}

// positionAliases is { positionId: [alias, ...] }, straight off the /parse
// response (itself read from the coach-editable position_settings table —
// see Positionsopsætning under Indstillinger). The server flags a mismatch
// at parse time, but the coach can re-match a row to a different player in
// the review table below, so this has to be recomputed client-side on every
// selection change rather than trusting the server's one-time flag.
function kpPositionMismatch(filePosition, playerPositions, positionAliases) {
  if (!filePosition || !playerPositions || playerPositions.length === 0) return false;
  const term = String(filePosition).toUpperCase();
  const aliasLists = Object.values(positionAliases || {});
  const recognised = aliasLists.some((aliases) => aliases.includes(term));
  if (!recognised) return false;
  return !playerPositions.some((id) => (positionAliases[id] || []).includes(term));
}

// Uploads a GPS/video-tracking export (.ods/.xlsx/.csv) for this specific
// match — stats only ever exist attached to a Kampplan, never freestanding
// (see schema.sql). The server matches each row to a roster player by
// jersey number; anything it couldn't match (or matched to the wrong
// person — squad numbers do shift game to game) is fixed here before
// anything is actually saved to development_plans... to match_stats,
// rather.
function KpStatsUpload({ planId, players }) {
  // Same collapsed-by-default pattern as KpCategorySection — see that
  // component's comment. Clicking "Upload statistik" also expands, since
  // the upload UI it opens lives inside the collapsible area.
  const [expanded, setExpanded] = useState(false);
  const [existing, setExisting] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null); // { rows, skipped } | null
  const [positionAliases, setPositionAliases] = useState({});
  const [previewError, setPreviewError] = useState("");
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (!planId) return;
    api.getMatchStats(planId).then(setExisting).catch(() => setExisting([]));
  }, [planId]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same filename be picked again later
    if (!file) return;
    setPreviewError("");
    setUploading(true);
    try {
      const result = await api.parseMatchStats(planId, file);
      setPreview({
        rows: result.rows.map((r) => ({ ...r, playerId: r.matchedPlayerId })),
        skipped: result.skipped,
      });
      setPositionAliases(result.positionAliases || {});
    } catch (err) {
      setPreviewError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const setRowPlayer = (i, playerId) => {
    setPreview((p) => ({
      ...p,
      rows: p.rows.map((r, idx) => (idx === i ? { ...r, playerId: playerId || null } : r)),
    }));
  };

  const commit = async () => {
    setCommitError("");
    setCommitting(true);
    try {
      const saved = await api.commitMatchStats(planId, preview.rows);
      setExisting(saved);
      setPreview(null);
    } catch (err) {
      setCommitError(err.message);
    } finally {
      setCommitting(false);
    }
  };

  const matchedCount = preview ? preview.rows.filter((r) => r.playerId).length : 0;

  const removeStats = async () => {
    if (
      !window.confirm(
        `Slet al kampstatistik for denne kamp (${existing.length} spiller${existing.length !== 1 ? "e" : ""})? Det kan ikke fortrydes.`
      )
    ) {
      return;
    }
    setDeleteError("");
    setDeleting(true);
    try {
      await api.deleteMatchStats(planId);
      setExisting([]);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.categoryBlock}>
      <div
        className="category-head-row-collapsible"
        style={styles.categoryHeadRow}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.iconBtnGhost}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Skjul" : "Vis"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span style={styles.categoryLabel}>Kampstatistik</span>
          <span style={styles.categoryAvg}>{existing ? existing.length : 0}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
          {planId && (
            <button
              style={styles.linkBtn}
              onClick={() => {
                setExpanded(true);
                fileInputRef.current?.click();
              }}
              disabled={uploading}
            >
              <Upload size={12} /> {uploading ? "Læser fil…" : "Upload statistik"}
            </button>
          )}
          {existing && existing.length > 0 && !preview && (
            <button style={styles.linkBtnDanger} onClick={removeStats} disabled={deleting}>
              <Trash2 size={12} /> {deleting ? "Sletter…" : "Slet statistik"}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ods,.xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>

      <div className={`category-skills${expanded ? " category-skills-open" : ""}`}>
      {!planId && (
        <p style={styles.noSkills}>Gem kampplanen først — så kan du uploade statistik bagefter.</p>
      )}

      {previewError && <div style={styles.errorBannerRow}>{previewError}</div>}

      {preview ? (
        <div>
          <p style={styles.subtext}>
            {matchedCount} af {preview.rows.length} rækker matchet automatisk på spillernummer.
            {preview.skipped > 0
              ? ` ${preview.skipped} række${preview.skipped !== 1 ? "r" : ""} uden spillernavn (fx modstanderens spillere) sprunget over.`
              : ""}{" "}
            Ret forkerte match herunder, før du gemmer.
          </p>
          {commitError && <div style={styles.errorBannerRow}>{commitError}</div>}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Nr.</th>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Navn i filen</th>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Position i filen</th>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Spiller i appen</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r, i) => {
                  const matched = r.playerId ? players.find((p) => p.id === r.playerId) : null;
                  const matchedPositions = matched
                    ? [matched.primaryPosition, matched.secondaryPosition].filter(Boolean)
                    : [];
                  const mismatch = matched
                    ? kpPositionMismatch(r.filePosition, matchedPositions, positionAliases)
                    : false;
                  return (
                    <tr key={i} style={{ borderTop: "1px solid #E3E3E3" }}>
                      <td style={{ padding: "4px 8px" }}>{r.fileNumber}</td>
                      <td style={{ padding: "4px 8px" }}>{r.fileName}</td>
                      <td
                        style={{ padding: "4px 8px" }}
                        title={
                          mismatch
                            ? `Filen siger ${r.filePosition}, men spilleren er ikke tagget med den position i appen`
                            : undefined
                        }
                      >
                        {r.filePosition || "—"}
                        {mismatch && <span style={{ color: "#C22A1F", marginLeft: 4 }}>⚠</span>}
                      </td>
                      <td style={{ padding: "4px 8px" }}>
                        <select
                          style={{
                            ...styles.select,
                            ...(!r.playerId ? { borderColor: "#C22A1F" } : {}),
                          }}
                          value={r.playerId || ""}
                          onChange={(e) => setRowPlayer(i, e.target.value)}
                        >
                          <option value="">— spring over —</option>
                          {players.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button style={styles.primaryBtnSm} onClick={commit} disabled={committing || matchedCount === 0}>
              {committing ? "Gemmer…" : `Gem statistik for ${matchedCount} spiller${matchedCount !== 1 ? "e" : ""}`}
            </button>
            <button style={styles.ghostBtn} onClick={() => setPreview(null)}>
              Annuller
            </button>
          </div>
        </div>
      ) : existing && existing.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          {deleteError && <div style={styles.errorBannerRow}>{deleteError}</div>}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Spiller</th>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Position</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Min</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Afstand</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Pasn.</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Pasn. %</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Tacklinger</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Topfart</th>
              </tr>
            </thead>
            <tbody>
              {existing.map((r) => (
                <tr key={r.playerId} style={{ borderTop: "1px solid #E3E3E3" }}>
                  <td style={{ padding: "4px 8px", fontWeight: 600 }}>{r.playerName}</td>
                  <td style={{ padding: "4px 8px" }}>{r.position || "—"}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>{r.minutes ?? "—"}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>
                    {r.distanceKm != null ? `${r.distanceKm}km` : "—"}
                  </td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>{r.passes ?? "—"}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>
                    {r.passSuccessPct != null ? `${r.passSuccessPct}%` : "—"}
                  </td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>{r.tackles ?? "—"}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right" }}>
                    {r.topSpeedKmh != null ? `${r.topSpeedKmh}km/t` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        planId && <p style={styles.noSkills}>Ingen statistik uploadet endnu for denne kamp.</p>
      )}
      </div>
    </div>
  );
}

// Coach-entered 1-5 rating of how each player performed in this specific
// match, keyed by player name (same convention as playerGoals). Screen-only —
// deliberately never read by kpPrintPlan — used to build a per-player
// performance-over-time report (PlayerStatsView) to help spot who's
// ready to progress to the next level of training.
// Same collapsed-by-default pattern as KpCategorySection — see that
// component's comment. The count is ratings given so far (not roster size),
// since that's the more useful "how much of this is done" signal here.
function KpPerformanceScores({ planId, players, scores, onSetScore }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={styles.categoryBlock}>
      <div
        className="category-head-row-collapsible"
        style={styles.categoryHeadRow}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.iconBtnGhost}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Skjul" : "Vis"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span style={styles.categoryLabel}>Spillerbedømmelse</span>
        </div>
        <span style={styles.categoryAvg}>{Object.keys(scores).length}</span>
      </div>
      <div className={`category-skills${expanded ? " category-skills-open" : ""}`}>
        <p style={styles.subtext}>
          Vurdér hver spillers indsats i denne kamp på en skala fra 1-5. Vises kun her — kommer ikke
          med på den udskrevne kampplan.
        </p>
        {!planId ? (
          <p style={styles.noSkills}>
            Gem kampplanen først — så kan du bedømme spillernes indsats bagefter.
          </p>
        ) : players.length === 0 ? (
          <p style={styles.noSkills}>
            Tilføj spillere under "Position &amp; opstilling" for at bedømme deres indsats.
          </p>
        ) : (
          players.map(({ id, name }) => {
            const value = scores[id];
            return (
              <div key={id} style={styles.skillRow}>
                <span style={styles.skillName}>{name}</span>
                <div style={styles.scoreButtons}>
                  {[1, 2, 3, 4, 5].map((v) => {
                    const active = value === v;
                    return (
                      <button
                        key={v}
                        onClick={() => onSetScore(id, value === v ? null : v)}
                        style={{
                          ...styles.scoreBtn,
                          background: active ? scoreColor(v) : "#FFFFFF",
                          color: active ? "#FFFFFF" : "#1A1A1A",
                          borderColor: active ? scoreColor(v) : "#D9D4C7",
                        }}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Same collapsed-by-default pattern as KpCategorySection — see that
// component's comment. "Rediger" also expands, since editing needs the
// textarea visible.
function KpNotesField({ value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const startEdit = () => {
    setDraft(value || "");
    setEditing(true);
    setExpanded(true);
  };
  const save = () => {
    onChange(draft);
    setEditing(false);
  };

  return (
    <div style={styles.categoryBlock}>
      <div
        className="category-head-row-collapsible"
        style={styles.categoryHeadRow}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.iconBtnGhost}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Skjul" : "Vis"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span style={styles.categoryLabel}>Noter generelt før kamp</span>
        </div>
        {!editing && (
          <button
            style={styles.linkBtn}
            onClick={(e) => {
              e.stopPropagation();
              startEdit();
            }}
          >
            <Pencil size={12} /> Rediger
          </button>
        )}
      </div>
      <div className={`category-skills${expanded ? " category-skills-open" : ""}`}>
        {editing ? (
          <div>
            <AutoTextarea
              style={{ ...styles.textarea, minHeight: 120 }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button style={styles.primaryBtnSm} onClick={save}>
                Gem
              </button>
              <button style={styles.ghostBtn} onClick={() => setEditing(false)}>
                Annuller
              </button>
            </div>
          </div>
        ) : value ? (
          <div
            style={{ fontSize: 14, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: kpLinkify(value) }}
          />
        ) : (
          <p style={styles.noSkills}>Ingen noter endnu. Klik Rediger for at tilføje noter — links indsat her kan klikkes.</p>
        )}
      </div>
    </div>
  );
}

// The most recent period overall (by date), regardless of whether anyone's
// been scored in it yet — goals can be set ahead of the first evaluation,
// so this deliberately doesn't require scores the way getLatestScoredPeriod
// does (that one's for "what should the roster card show", this is "what's
// the player currently working towards").
function kpLatestPeriod(data) {
  const periods = sortedPeriods(data.periods);
  return periods.length ? periods[periods.length - 1] : null;
}

// A player's currently defined goals, for the "Individuelt mål" list-select
// on a Kampplan — skill name + Fokusområder only (not Målsætning; that's a
// longer-form note, not a short tactical prompt for a single match). Goals
// with no Fokusområder set are skipped since there'd be nothing to show.
function kpGoalOptionsForPlayer(data, playerId) {
  const period = kpLatestPeriod(data);
  if (!period) return [];
  const goals = data.goals[playerId]?.[period.id] || {};
  return Object.keys(goals)
    .map((skillId) => {
      const meta = findSkillMeta(data.config, skillId);
      const goal = goals[skillId];
      if (!meta || !goal.focusAreas) return null;
      return { skillId, label: `${meta.skill.name} — ${goal.focusAreas}` };
    })
    .filter(Boolean);
}

// A collapsed-by-default category card — the read-only share-view
// equivalent of the chrome KpCategorySection/KpPositionTable/etc. all use
// in the editor (chevron toggle, count badge, same categoryBlock/
// categoryHeadRow styling). Takes raw content as children rather than an
// items list, since what goes inside varies a lot more here (plain text,
// a table, nothing to edit) than it does in the editor's own sections.
function KpShareSection({ title, count, children }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={styles.categoryBlock}>
      <div
        className="category-head-row-collapsible"
        style={styles.categoryHeadRow}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.iconBtnGhost}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Skjul" : "Vis"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span style={styles.categoryLabel}>{title}</span>
        </div>
        <span style={styles.categoryAvg}>{count}</span>
      </div>
      <div className={`category-skills${expanded ? " category-skills-open" : ""}`}>{children}</div>
    </div>
  );
}

// Read-only twin of KpCategorySection — same per-item bordered-box markup
// (border/radius/padding/margin all match), just a static category label
// and text instead of a select + textarea.
function KpShareCategoryBlock({ title, items }) {
  const filled = (items || []).filter((x) => x.text);
  return (
    <KpShareSection title={title} count={filled.length}>
      {filled.length === 0 ? (
        <p style={styles.noSkills}>Ingen afsnit endnu.</p>
      ) : (
        filled.map((item, i) => (
          <div key={i} style={{ border: "1px solid #E3E3E3", borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{item.category}</div>
            <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{item.text}</div>
          </div>
        ))
      )}
    </KpShareSection>
  );
}

// Public, read-only, no login — what a player sees after opening a
// kampplan share link (see KpShareLinkCard for how the link is minted,
// server/routes/matchPlanShare.js for the token lookup and expiry check).
// Every section mirrors the coach editor's own layout exactly (same
// tables, same category cards, same collapsed-by-default chrome via
// KpShareSection/KpShareCategoryBlock above) — just nothing is editable,
// and the order/subset is player-relevant only: individuelle mål first,
// then lineup 1 (never lineup 2, reserves, notes, or coach-only things
// like performance ratings).
function KampplanShareView({ plan }) {
  const positionsSorted = [...(plan.positions || [])]
    .filter((r) => r.name && r.name.trim())
    .sort((a, b) => Number(a.position) - Number(b.position));
  const lineup2Sorted = [...(plan.positions2 || [])]
    .filter((r) => r.name && r.name.trim())
    .sort((a, b) => Number(a.position) - Number(b.position));
  const rosterNamesUnique = [...new Set(positionsSorted.map((r) => r.name.trim()))];
  const reserveNamesUnique = [
    ...new Set(
      (plan.reserves || [])
        .map((r) => (typeof r === "string" ? r : r.name))
        .map((n) => n && n.trim())
        .filter(Boolean)
    ),
  ];
  const goalNames = [...rosterNamesUnique, ...reserveNamesUnique.filter((n) => !rosterNamesUnique.includes(n))];
  const filledTeamGoals = (plan.teamGoals || []).filter(Boolean);
  // Bordered, unlike the editor's own (borderless) versions of these two
  // tables — on the share link there's no adjacent input to anchor each
  // row to, so gridlines are what keep Pos/Navn/Individuelt mål (or
  // Position/Spillernavn) readable as columns rather than a run-on list.
  const th = {
    textAlign: "left",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6B6B6B",
    padding: "5px 8px",
    fontWeight: 700,
    border: "1px solid #D9D4C7",
    background: "#F6F3EC",
  };
  const td = {
    padding: "6px 8px",
    border: "1px solid #D9D4C7",
  };

  // The pitch replaces the position table when the plan's formation has a
  // layout; a formation without one (or since deleted) falls back to the
  // table so players still see who plays where.
  const lineupSection = (title, sorted, rawPositions, formation, slots) => (
    <KpShareSection title={title} count={sorted.length}>
      <div style={{ maxWidth: 220, marginBottom: 14 }}>
        <div style={styles.fieldLabel}>Formation</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{formation || "–"}</div>
      </div>
      {slots && sorted.length > 0 ? (
        <LineupPitch formation={{ slots }} positions={rawPositions} reserves={plan.reserves} />
      ) : sorted.length === 0 ? (
        <p style={styles.noSkills}>Ikke sat endnu.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 70 }}>Position</th>
              <th style={th}>Spillernavn</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, width: 70 }}>{r.position}</td>
                <td style={td}>{r.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </KpShareSection>
  );

  return (
    <div style={styles.app}>
      <style>{`
        .category-skills { display: none; }
        .category-skills.category-skills-open { display: block; }
        .category-head-row-collapsible { cursor: pointer; }
      `}</style>
      <div style={styles.headerTopBar}>
        <div style={styles.headerTopRow}>
          <div style={styles.brand}>
            <span style={styles.brandText}>VB PIGE AKADEMI</span>
          </div>
          <img src={LOGO_SRC} alt="Klublogo" style={styles.logoImg} />
        </div>
      </div>
      <main style={styles.main}>
        <h1 style={styles.h1}>{plan.opponent || "Kampplan"}</h1>
        <p style={styles.subtext}>{kpFmtDate(plan.date)}</p>

        <KpShareSection title="Individuelle mål" count={goalNames.length}>
          {goalNames.length === 0 ? (
            <p style={styles.noSkills}>
              Ingen spillere under "Position &amp; opstilling" eller reserver endnu.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Pos</th>
                  <th style={th}>Navn</th>
                  <th style={th}>Individuelt mål</th>
                </tr>
              </thead>
              <tbody>
                {goalNames.map((name) => {
                  const pos = positionsSorted.find((r) => r.name.trim() === name);
                  const goal = (plan.playerGoals || {})[name];
                  const goalNote = (plan.playerGoalNotes || {})[name];
                  return (
                    <tr key={name}>
                      <td style={{ ...td, width: 60 }}>{pos ? pos.position : "Res."}</td>
                      <td style={{ ...td, width: 110 }}>{name}</td>
                      <td style={{ ...td, whiteSpace: "pre-wrap" }}>
                        {goal || ""}
                        {goal && goalNote ? (
                          <>
                            <br />
                            {goalNote}
                          </>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </KpShareSection>

        {lineupSection("Position & opstilling", positionsSorted, plan.positions, plan.formation, plan.formationSlots)}

        {lineup2Sorted.length > 0 &&
          lineupSection("Position & opstilling 2", lineup2Sorted, plan.positions2, plan.formation2, plan.formationSlots2)}

        <KpShareSection title="Målsætning for holdet" count={filledTeamGoals.length}>
          {filledTeamGoals.length === 0 ? (
            <p style={styles.noSkills}>–</p>
          ) : (
            filledTeamGoals.map((g, i) => (
              <p key={i} style={{ margin: "0 0 8px" }}>
                {g}
              </p>
            ))
          )}
        </KpShareSection>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ ...styles.fieldLabel, fontSize: 13, marginBottom: 10 }}>Vi har bolden</div>
            <KpShareCategoryBlock title="Opbygningsspil" items={plan.buildUp} />
            <KpShareCategoryBlock title="Afslutningsspil" items={plan.finishing} />
          </div>
          <div>
            <div style={{ ...styles.fieldLabel, fontSize: 13, marginBottom: 10 }}>Når de har bolden</div>
            <KpShareCategoryBlock title="Forsvarsspil" items={plan.defense} />
            <KpShareCategoryBlock title="Erobringsspil" items={plan.conquest} />
          </div>
        </div>

        <KpShareCategoryBlock title="Yderligere aftaler" items={plan.extras} />
      </main>
    </div>
  );
}

function KampplanEditor({ plan, setPlan, onBack, onSave, onPrint, saving, players, data, formations }) {
  const roster = [...plan.positions]
    .filter((r) => r.name && r.name.trim())
    .sort((a, b) => Number(a.position) - Number(b.position));
  const rosterNames = [...new Set(roster.map((r) => r.name.trim()))];
  const playerNames = [...new Set((players || []).map((p) => p.name).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "da")
  );
  const nameToPlayer = new Map((players || []).filter((p) => p.name).map((p) => [p.name, p]));
  // Whether each player's "Individuelt mål" row is in list-select mode —
  // purely local UI state (not saved with the plan, same as a text field's
  // focus state), matching the same "list or free text" convenience the
  // position/reserve rows already have via their `useList` flag.
  const [goalUseList, setGoalUseList] = useState({});
  // Starts collapsed, same as every other category block on this page (see
  // KpCategorySection) — this one is built inline rather than through that
  // component since it edits a plain string array, not {category, text}.
  const [teamGoalsExpanded, setTeamGoalsExpanded] = useState(false);
  // Same for the "Individuelle mål" table — also built inline since it
  // joins roster/reserve names with each player's own defined goals.
  const [individualGoalsExpanded, setIndividualGoalsExpanded] = useState(false);
  // Older plans stored reserves as plain name strings; normalize those to
  // the { name, useList } shape used going forward before any edit touches
  // them, so a merge patch never spreads onto a raw string.
  const reserves = (plan.reserves || []).map((r) =>
    typeof r === "string" ? { name: r, useList: false } : r
  );
  // Individuelle mål covers the lineup 1 starters plus reserves — a reserve
  // can still come on, so she needs the same "what to focus on" prompt.
  // Starters first (in position order, via rosterNames), then any
  // reserve-only names after.
  const reserveNames = [...new Set(reserves.map((r) => r.name && r.name.trim()).filter(Boolean))];
  const individualGoalNames = [...rosterNames, ...reserveNames.filter((n) => !rosterNames.includes(n))];
  // Performance scoring covers anyone in either lineup or the reserves list,
  // not just the lineup 1 starters — but only names that resolve to a real
  // player record, since a rating links to a player_id, not a free-text name.
  const performanceRosterNames = [
    ...new Set(
      [...plan.positions, ...plan.positions2, ...reserves]
        .filter((r) => r.name && r.name.trim())
        .map((r) => r.name.trim())
    ),
  ]
    .map((name) => (players || []).find((p) => p.name && p.name.trim() === name))
    .filter(Boolean)
    .map((p) => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "da"));

  // Performance ratings are linked to this plan's real id in their own
  // table (see schema.sql), so — unlike the rest of the editor's fields —
  // each rating is written immediately rather than batched into the next
  // "Gem kampplan". KpPerformanceScores only calls this once plan.id exists.
  const onSetPerformanceScore = async (playerId, value) => {
    const prev = plan.performanceScores || {};
    try {
      await api.setMatchPerformanceScore(plan.id, playerId, value);
      const next =
        value == null
          ? Object.fromEntries(Object.entries(prev).filter(([id]) => id !== playerId))
          : { ...prev, [playerId]: value };
      setPlan({ ...plan, performanceScores: next });
    } catch (e) {
      /* leave local state as-is on failure so the UI reflects what's actually saved */
    }
  };

  return (
    <div>
      <style>{`
        .category-skills { display: none; }
        .category-skills.category-skills-open { display: block; }
        .category-head-row-collapsible { cursor: pointer; }
      `}</style>
      <button style={styles.backBtn} onClick={onBack}>
        <ChevronLeft size={16} /> Alle kampplaner
      </button>

      <div style={{ ...styles.addCardCol, display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 14 }}>
        <div>
          <div style={styles.fieldLabel}>Række</div>
          <select
            style={styles.select}
            value={plan.division}
            onChange={(e) => setPlan({ ...plan, division: e.target.value })}
          >
            <option value="">Vælg række</option>
            {KAMPPLAN_DIVISIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={styles.fieldLabel}>Modstander</div>
          <input
            style={styles.input}
            type="text"
            value={plan.opponent}
            onChange={(e) => setPlan({ ...plan, opponent: e.target.value })}
          />
        </div>
        <div>
          <div style={styles.fieldLabel}>Kampdato</div>
          <input
            style={styles.input}
            type="date"
            value={plan.date}
            onChange={(e) => setPlan({ ...plan, date: e.target.value })}
          />
        </div>
      </div>

      <KpShareLinkCard plan={plan} onGenerated={(token) => setPlan({ ...plan, shareToken: token })} />

      <div style={styles.categoryBlock}>
        <div
          className="category-head-row-collapsible"
          style={styles.categoryHeadRow}
          onClick={() => setTeamGoalsExpanded((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              style={styles.iconBtnGhost}
              onClick={(e) => {
                e.stopPropagation();
                setTeamGoalsExpanded((v) => !v);
              }}
              title={teamGoalsExpanded ? "Skjul" : "Vis"}
            >
              {teamGoalsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <span style={styles.categoryLabel}>Målsætning for holdet</span>
          </div>
          <span style={styles.categoryAvg}>{plan.teamGoals.length}</span>
        </div>
        <div className={`category-skills${teamGoalsExpanded ? " category-skills-open" : ""}`}>
          {plan.teamGoals.map((g, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 26px", gap: 8, alignItems: "start", marginBottom: 8 }}>
              <AutoTextarea
                style={{ ...styles.textarea, minHeight: 44 }}
                value={g}
                onChange={(e) => setPlan({ ...plan, teamGoals: kpSetStringAt(plan.teamGoals, i, e.target.value) })}
              />
              <button
                style={{ ...styles.iconBtnGhost, marginTop: 6 }}
                onClick={() => setPlan({ ...plan, teamGoals: kpRemoveAt(plan.teamGoals, i) })}
                title="Fjern"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            style={{ ...styles.ghostBtn, borderStyle: "dashed", padding: "8px 14px", fontSize: 13 }}
            onClick={() => setPlan({ ...plan, teamGoals: [...plan.teamGoals, ""] })}
          >
            <Plus size={14} /> Tilføj målsætning
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div>
          <div style={{ ...styles.fieldLabel, fontSize: 13, marginBottom: 10 }}>Vi har bolden</div>
          <KpCategorySection
            title="Opbygningsspil"
            items={plan.buildUp}
            categories={KP_BUILDUP_CATEGORIES}
            defaultCategory={KP_BUILDUP_CATEGORIES[0]}
            onAdd={(cat) => setPlan({ ...plan, buildUp: [...plan.buildUp, { category: cat, text: "" }] })}
            onUpdate={(i, patch) => setPlan({ ...plan, buildUp: kpSetAt(plan.buildUp, i, patch) })}
            onRemove={(i) => setPlan({ ...plan, buildUp: kpRemoveAt(plan.buildUp, i) })}
          />
          <KpCategorySection
            title="Afslutningsspil"
            items={plan.finishing}
            categories={KP_FINISHING_CATEGORIES}
            defaultCategory={KP_FINISHING_CATEGORIES[0]}
            onAdd={(cat) => setPlan({ ...plan, finishing: [...plan.finishing, { category: cat, text: "" }] })}
            onUpdate={(i, patch) => setPlan({ ...plan, finishing: kpSetAt(plan.finishing, i, patch) })}
            onRemove={(i) => setPlan({ ...plan, finishing: kpRemoveAt(plan.finishing, i) })}
          />
        </div>
        <div>
          <div style={{ ...styles.fieldLabel, fontSize: 13, marginBottom: 10 }}>Når de har bolden</div>
          <KpCategorySection
            title="Forsvarsspil"
            items={plan.defense}
            categories={KP_DEFENSE_CATEGORIES}
            defaultCategory={KP_DEFENSE_CATEGORIES[0]}
            onAdd={(cat) => setPlan({ ...plan, defense: [...plan.defense, { category: cat, text: "" }] })}
            onUpdate={(i, patch) => setPlan({ ...plan, defense: kpSetAt(plan.defense, i, patch) })}
            onRemove={(i) => setPlan({ ...plan, defense: kpRemoveAt(plan.defense, i) })}
          />
          <KpCategorySection
            title="Erobringsspil"
            items={plan.conquest}
            categories={KP_CONQUEST_CATEGORIES}
            defaultCategory={KP_CONQUEST_CATEGORIES[0]}
            onAdd={(cat) => setPlan({ ...plan, conquest: [...plan.conquest, { category: cat, text: "" }] })}
            onUpdate={(i, patch) => setPlan({ ...plan, conquest: kpSetAt(plan.conquest, i, patch) })}
            onRemove={(i) => setPlan({ ...plan, conquest: kpRemoveAt(plan.conquest, i) })}
          />
        </div>
      </div>

      <KpCategorySection
        title="Yderligere aftaler"
        items={plan.extras}
        categories={KP_EXTRAS_CATEGORIES}
        defaultCategory={KP_EXTRAS_CATEGORIES[0]}
        onAdd={(cat) => setPlan({ ...plan, extras: [...plan.extras, { category: cat, text: "" }] })}
        onUpdate={(i, patch) => setPlan({ ...plan, extras: kpSetAt(plan.extras, i, patch) })}
        onRemove={(i) => setPlan({ ...plan, extras: kpRemoveAt(plan.extras, i) })}
      />

      <KpNotesField
        value={plan.generalNotes}
        onChange={(v) => setPlan({ ...plan, generalNotes: v })}
      />

      <KpPositionTable
        title="Position & opstilling"
        positions={plan.positions}
        formation={plan.formation}
        playerNames={playerNames}
        formations={formations}
        reserves={reserves}
        onLineupChange={({ positions, reserves: nextReserves }) =>
          setPlan({ ...plan, positions, reserves: nextReserves })
        }
        onFormationChange={(v) => setPlan({ ...plan, formation: v })}
        onUpdate={(i, patch) => setPlan({ ...plan, positions: kpSetAt(plan.positions, i, patch) })}
        onAdd={() =>
          setPlan({ ...plan, positions: [...plan.positions, { position: "1", name: "", useList: true }] })
        }
        onRemove={(i) => setPlan({ ...plan, positions: kpRemoveAt(plan.positions, i) })}
      />

      <KpReserveTable
        reserves={reserves}
        playerNames={playerNames}
        onUpdate={(i, patch) => setPlan({ ...plan, reserves: kpSetAt(reserves, i, patch) })}
        onAdd={() => setPlan({ ...plan, reserves: [...reserves, { name: "", useList: true }] })}
        onRemove={(i) => setPlan({ ...plan, reserves: kpRemoveAt(reserves, i) })}
      />

      <KpPositionTable
        title="Position & opstilling 2"
        positions={plan.positions2}
        formation={plan.formation2}
        playerNames={playerNames}
        formations={formations}
        reserves={reserves}
        onLineupChange={({ positions, reserves: nextReserves }) =>
          setPlan({ ...plan, positions2: positions, reserves: nextReserves })
        }
        onFormationChange={(v) => setPlan({ ...plan, formation2: v })}
        onUpdate={(i, patch) => setPlan({ ...plan, positions2: kpSetAt(plan.positions2, i, patch) })}
        onAdd={() =>
          setPlan({ ...plan, positions2: [...plan.positions2, { position: "1", name: "", useList: true }] })
        }
        onRemove={(i) => setPlan({ ...plan, positions2: kpRemoveAt(plan.positions2, i) })}
      />

      <div style={styles.categoryBlock}>
        <div
          className="category-head-row-collapsible"
          style={styles.categoryHeadRow}
          onClick={() => setIndividualGoalsExpanded((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              style={styles.iconBtnGhost}
              onClick={(e) => {
                e.stopPropagation();
                setIndividualGoalsExpanded((v) => !v);
              }}
              title={individualGoalsExpanded ? "Skjul" : "Vis"}
            >
              {individualGoalsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <span style={styles.categoryLabel}>Individuelle mål</span>
          </div>
          <span style={styles.categoryAvg}>{individualGoalNames.length}</span>
        </div>
        <div className={`category-skills${individualGoalsExpanded ? " category-skills-open" : ""}`}>
        {individualGoalNames.length === 0 ? (
          <p style={styles.noSkills}>
            Tilføj spillere under "Position &amp; opstilling" eller "Reserver" for at sætte individuelle mål.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B6B6B", padding: "0 8px 6px 0", fontWeight: 700 }}>
                  Pos
                </th>
                <th style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B6B6B", padding: "0 8px 6px 0", fontWeight: 700 }}>
                  Navn
                </th>
                <th style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B6B6B", padding: "0 8px 6px 0", fontWeight: 700 }}>
                  Individuelt mål
                </th>
                <th
                  style={{ width: 60, textAlign: "center", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B6B6B", padding: "0 8px 6px 0", fontWeight: 700 }}
                  title="Vælg fra spillerens definerede mål frem for at skrive frit"
                >
                  Liste
                </th>
              </tr>
            </thead>
            <tbody>
              {individualGoalNames.map((name) => {
                const posForName = roster.find((r) => r.name.trim() === name);
                const player = nameToPlayer.get(name);
                const goalOptions = player ? kpGoalOptionsForPlayer(data, player.id) : [];
                const useList = Boolean(goalUseList[name]) && goalOptions.length > 0;
                return (
                  <tr key={name}>
                    <td style={{ width: 60, padding: "4px 8px 4px 0" }}>{posForName ? posForName.position : "Res."}</td>
                    <td style={{ width: 110, padding: "4px 8px 4px 0" }}>{name}</td>
                    <td style={{ padding: "4px 0" }}>
                      {useList ? (
                        <select
                          style={styles.select}
                          value={plan.playerGoals[name] || ""}
                          onChange={(e) =>
                            setPlan({
                              ...plan,
                              playerGoals: { ...plan.playerGoals, [name]: e.target.value },
                            })
                          }
                        >
                          <option value="">Vælg mål</option>
                          {goalOptions.map((g) => (
                            <option key={g.skillId} value={g.label}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <AutoTextarea
                          style={{ ...styles.textarea, minHeight: 38 }}
                          placeholder="Individuelt mål"
                          value={plan.playerGoals[name] || ""}
                          onChange={(e) =>
                            setPlan({
                              ...plan,
                              playerGoals: { ...plan.playerGoals, [name]: e.target.value },
                            })
                          }
                        />
                      )}
                      {(plan.playerGoals[name] || "").trim() && (
                        <AutoTextarea
                          style={{ ...styles.textarea, minHeight: 38, marginTop: 6 }}
                          placeholder="Note til målet"
                          value={(plan.playerGoalNotes || {})[name] || ""}
                          onChange={(e) =>
                            setPlan({
                              ...plan,
                              playerGoalNotes: { ...(plan.playerGoalNotes || {}), [name]: e.target.value },
                            })
                          }
                        />
                      )}
                    </td>
                    <td style={{ width: 60, padding: "4px 8px 4px 0", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={useList}
                        disabled={goalOptions.length === 0}
                        onChange={(e) => setGoalUseList({ ...goalUseList, [name]: e.target.checked })}
                        title={
                          goalOptions.length === 0
                            ? "Spilleren har ingen mål med fokusområder sat endnu"
                            : "Vælg fra spillerens definerede mål frem for at skrive frit"
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        </div>
      </div>

      <KpPerformanceScores
        planId={plan.id}
        players={performanceRosterNames}
        scores={plan.performanceScores || {}}
        onSetScore={onSetPerformanceScore}
      />

      <KpStatsUpload planId={plan.id} players={(players || []).slice().sort((a, b) => a.name.localeCompare(b.name, "da"))} />

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20, position: "sticky", bottom: 16 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E3E3E3", padding: 10, borderRadius: 10, display: "flex", gap: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          <button style={styles.ghostBtn} onClick={() => onPrint(plan)}>
            <Printer size={14} /> Print
          </button>
          <button style={styles.primaryBtn} onClick={onSave} disabled={saving}>
            {saving ? "Gemmer…" : "Gem kampplan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function KampplanList({ planIndex, onNew, onEdit, onCopy, onDelete, onPrint }) {
  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Kampplaner</h1>
          <p style={styles.subtext}>Taktiske planer pr. kamp — målsætninger, opstilling og individuelle mål.</p>
        </div>
        <button style={styles.primaryBtn} onClick={onNew}>
          <Plus size={16} /> Ny kampplan
        </button>
      </div>

      {planIndex.length === 0 ? (
        <div style={styles.emptyState}>
          <Swords size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen kampplaner endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Opret din første kampplan, eller kopiér en fra tidligere når du har en.
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {planIndex.map((p) => (
            <div key={p.id} style={styles.playerCard}>
              <div style={styles.playerName}>{p.opponent || "Uden navn"}</div>
              <div style={styles.subtext}>
                {kpFmtDate(p.date)}
                {p.division ? ` · ${p.division}` : ""}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                <button style={{ ...styles.teamFilterChip, flex: 1, textAlign: "center" }} onClick={() => onEdit(p.id)}>
                  Redigér
                </button>
                <button style={{ ...styles.teamFilterChip, flex: 1, textAlign: "center" }} onClick={() => onCopy(p.id)}>
                  Kopiér
                </button>
                <button style={{ ...styles.teamFilterChip, flex: 1, textAlign: "center" }} onClick={() => onPrint(p.id)}>
                  Print
                </button>
                <button
                  style={{
                    ...styles.teamFilterChip,
                    flex: 1,
                    textAlign: "center",
                    color: "#E2231A",
                    borderColor: "#E2231A",
                  }}
                  onClick={() => onDelete(p.id)}
                >
                  Slet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Colours for the players in a comparison chart, in the order they were picked
// (no red: red is the coach's line elsewhere in the app).
const KAMP_COMPARE_COLORS = ["#1A1A1A", "#2D6CDF", "#E08A00", "#2E8B57", "#7B4FC9", "#D6457B", "#139AA0", "#8A6D3B"];
const KAMP_COMPARE_MAX = KAMP_COMPARE_COLORS.length;

// A dropdown button with a checkbox list (optionally searchable) that stays
// open while ticking. options: [{ value, label, color? }].
function MultiSelectDropdown({
  buttonText,
  options,
  selected,
  onToggle,
  onClear,
  clearLabel = "Ryd valg",
  alwaysShowClear = false,
  searchable = false,
  minWidth = 190,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = React.useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shown = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        style={{
          ...styles.select,
          width: "auto",
          minWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          textAlign: "left",
          cursor: "pointer",
          ...(selected.length > 0 ? { borderColor: "#111111" } : {}),
        }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{buttonText}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "calc(100% + 4px)",
            zIndex: 50,
            width: 280,
            maxWidth: "calc(100vw - 48px)",
            background: "#FFFFFF",
            border: "1px solid #D9D4C7",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            padding: 8,
          }}
        >
          {searchable && (
            <input
              style={{ ...styles.input, marginBottom: 6 }}
              placeholder="Søg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          <div role="listbox" aria-multiselectable="true" style={{ maxHeight: 280, overflowY: "auto" }}>
            {shown.map((o, i) => {
              const on = selected.includes(o.value);
              const heading = o.group && (i === 0 || shown[i - 1].group !== o.group);
              return (
                <React.Fragment key={o.value}>
                  {heading && (
                    <div
                      style={{
                        ...styles.fieldLabel,
                        margin: "8px 0 2px 6px",
                        fontSize: 11,
                      }}
                    >
                      {o.group}
                    </div>
                  )}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 14,
                      background: on ? "#F6F3EC" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => onToggle(o.value)}
                      style={on && o.color ? { accentColor: o.color } : undefined}
                    />
                    <span>{o.label}</span>
                  </label>
                </React.Fragment>
              );
            })}
            {shown.length === 0 && <div style={{ ...styles.subtext, padding: 6 }}>Ingen</div>}
          </div>
          {onClear && (alwaysShowClear || selected.length > 0) && (
            <button style={{ ...styles.linkBtn, marginTop: 6 }} onClick={onClear}>
              {clearLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// One measure across matches, one line per series (a player, or the average of
// a group). Points are evenly spaced in match order (not to scale in time) so
// matches close together stay readable, with the date under each point. With a
// single series the values are printed above the points; with several,
// hover/tap shows everyone's value for that match (plus opponent and level).
// series: [{ id, name, color }]; points (oldest first):
// { i, label, date, opponent, division, weight, [`v_${id}`]: number | null, [`n_${id}`]?: count }.
function MatchTrendChart({ title, unit = "", decimals = 0, domain, ticks, points, series, weighted = false }) {
  const fmt = (v) => `${v.toFixed(decimals).replace(".", ",")}${unit}`;
  const single = series.length === 1;
  const own = single ? points.map((pt) => pt[`v_${series[0].id}`]).filter((v) => typeof v === "number") : [];
  const last = own[own.length - 1];
  const prev = own[own.length - 2];
  const delta = typeof last === "number" && typeof prev === "number" ? last - prev : null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E3E3E3",
        borderRadius: 12,
        padding: "12px 12px 8px",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, letterSpacing: 0.3 }}>{title}</span>
        {single &&
          (typeof last === "number" ? (
            <span style={{ fontSize: 12, color: "#4A4A4A" }}>
              Seneste: <strong>{fmt(last)}</strong>
              {delta !== null && delta !== 0 && (
                <span style={{ color: delta > 0 ? "#4D7B4D" : "#B3261E", marginLeft: 6 }}>
                  {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(decimals).replace(".", ",")}
                  {unit.trim() === "%" ? " %-point" : ""}
                </span>
              )}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#8A8A8A" }}>Ingen data</span>
          ))}
      </div>
      {points.length === 0 ? (
        <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#8A8A8A" }}>
          Ingen kampe med denne statistik
        </div>
      ) : (
        <div style={{ width: "100%", height: 150, marginTop: 6 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 18, right: 14, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#EEEBE3" vertical={false} />
              <XAxis
                dataKey="i"
                interval={points.length > 6 ? "preserveStartEnd" : 0}
                tickFormatter={(i) => (points[i] ? points[i].label : "")}
                padding={{ left: 14, right: 14 }}
                tick={{ fontSize: 10, fill: "#6B6B6B" }}
                tickLine={false}
                axisLine={{ stroke: "#D9D4C7" }}
              />
              <YAxis
                domain={domain || [0, "auto"]}
                ticks={ticks}
                allowDecimals={decimals > 0}
                width={34}
                tick={{ fontSize: 10, fill: "#6B6B6B" }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                isAnimationActive={false}
                cursor={{ stroke: "#D9D4C7" }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const pt = payload[0].payload;
                  const rows = series.filter((s) => typeof pt[`v_${s.id}`] === "number");
                  if (rows.length === 0) return null;
                  return (
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #D9D4C7",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                      }}
                    >
                      <div style={{ color: "#6B6B6B", marginBottom: 2 }}>
                        {formatDate(pt.date)}
                        {pt.opponent ? ` · ${pt.opponent}` : ""}
                        {pt.division ? ` · ${pt.division}` : ""}
                      </div>
                      {weighted && (
                        <div style={{ color: "#6B6B6B", marginBottom: 2 }}>
                          Vægtet ×{String(pt.weight ?? 1).replace(".", ",")}
                        </div>
                      )}
                      {rows.map((s) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color, display: "inline-block" }} />
                          {!single && <span style={{ fontWeight: 500 }}>{s.name}</span>}
                          {fmt(pt[`v_${s.id}`])}
                          {pt[`n_${s.id}`] != null && (
                            <span style={{ fontWeight: 500, color: "#6B6B6B" }}>
                              ({pt[`n_${s.id}`]} spiller{pt[`n_${s.id}`] === 1 ? "" : "e"})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {series.map((s) => (
                <Line
                  key={s.id}
                  type="linear"
                  dataKey={`v_${s.id}`}
                  connectNulls
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: s.color, stroke: "#FFFFFF", strokeWidth: 1.5 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                  label={
                    single
                      ? {
                          position: "top",
                          fontSize: 11,
                          fontWeight: 700,
                          fill: "#1A1A1A",
                          formatter: (v) => (typeof v === "number" ? fmt(v) : ""),
                        }
                      : false
                  }
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// The measures the match statistics track per match: the coach's rating plus
// the same five tracking stats the table shows as averages.
const KAMP_TREND_CHARTS = [
  // Weighted by the match's række, like the table's average, so 0-6 not 1-5.
  { key: "score", title: "Kampscore (vægtet)", domain: [0, 6], ticks: [0, 1, 2, 3, 4, 5, 6], decimals: 1, weighted: true },
  { key: "passSuccessPct", title: "Pasningsfuldførelse", unit: "%", domain: [0, 100], ticks: [0, 50, 100] },
  { key: "highIntensityRuns", title: "High intensity runs" },
  { key: "distanceKm", title: "Km dækket", unit: " km", decimals: 1 },
  { key: "dribbles", title: "Driblinger" },
  { key: "tackles", title: "Taklinger" },
];

// Every other tracked stat, offered under Grafer on Statistik (off until ticked).
// Keys are the stat columns of the match statistics feed; "group" is the heading
// they sit under in the dropdown. Counts are plain numbers, 0-1 stats (starter,
// anfører, kampens spiller) just show as 0 or 1.
const KAMP_EXTRA_CHARTS = [
  { key: "minutes", title: "Minutter spillet", group: "Løb og fysik" },
  { key: "avgSpeedKmh", title: "Gennemsnitsfart", unit: " km/t", decimals: 1, group: "Løb og fysik" },
  { key: "topSpeedKmh", title: "Tophastighed", unit: " km/t", decimals: 1, group: "Løb og fysik" },
  { key: "sprints", title: "Sprint", group: "Løb og fysik" },
  { key: "passes", title: "Afleveringer", group: "Afleveringer" },
  { key: "passesSuccessful", title: "Vellykkede afleveringer", group: "Afleveringer" },
  { key: "passesUnsuccessful", title: "Mislykkede afleveringer", group: "Afleveringer" },
  { key: "shots", title: "Skud", group: "Angreb" },
  { key: "totalAttempts", title: "Afslutninger i alt", group: "Angreb" },
  { key: "goals", title: "Mål", group: "Angreb" },
  { key: "assists", title: "Assists", group: "Angreb" },
  { key: "goalInvolvements", title: "Målinvolveringer", group: "Angreb" },
  { key: "conversionRate", title: "Konverteringsrate", unit: "%", domain: [0, 100], ticks: [0, 50, 100], group: "Angreb" },
  { key: "interceptions", title: "Opsnapninger", group: "Forsvar" },
  { key: "looseBallRecoveries", title: "Generobringer af løs bold", group: "Forsvar" },
  { key: "fouls", title: "Frispark begået", group: "Forsvar" },
  { key: "saves", title: "Redninger", group: "Målmand" },
  { key: "goalKicks", title: "Målspark", group: "Målmand" },
  { key: "corners", title: "Hjørnespark", group: "Standardsituationer" },
  { key: "freeKicks", title: "Frispark", group: "Standardsituationer" },
  { key: "penaltyKicks", title: "Straffespark", group: "Standardsituationer" },
  { key: "throwIns", title: "Indkast", group: "Standardsituationer" },
  { key: "totalEvents", title: "Hændelser i alt", group: "Andet" },
  { key: "starts", title: "Starter", group: "Andet" },
  { key: "captaincies", title: "Anfører", group: "Andet" },
  { key: "playerOfTheMatch", title: "Kampens spiller", group: "Andet" },
];
const KAMP_ALL_CHARTS = [
  ...KAMP_TREND_CHARTS.map((c) => ({ ...c, group: "Standardgrafer" })),
  ...KAMP_EXTRA_CHARTS,
];
const KAMP_DEFAULT_CHART_KEYS = KAMP_TREND_CHARTS.map((c) => c.key);
const KAMP_ALL_CHART_KEYS = KAMP_ALL_CHARTS.map((c) => c.key);
// The stat columns behind the charts (everything but the coach's rating).
const KAMP_STAT_KEYS = KAMP_ALL_CHART_KEYS.filter((k) => k !== "score");

// Stats where a 0 for the whole squad in a match is perfectly normal (a match
// with no goals, no penalties, no keeper saves ...) — for these a squad-wide 0
// is a real result. For every other stat a squad-wide 0 means the export
// didn't record it, and the charts leave that match out instead.
const KAMP_RARE_STATS = new Set([
  "goals", "assists", "goalInvolvements", "penaltyKicks", "freeKicks", "corners", "saves",
  "goalKicks", "captaincies", "playerOfTheMatch", "starts", "fouls",
]);

const KAMP_UNSET_LEVEL = "__unset";

// Aggregates every match plan's per-player performance score (1-5, entered
// on Kampplan after each game) plus their average tracking stats (from
// match_stats — see server/routes/matchPlans.js's /stats-summary) into one
// row per player, to give a clear read on who's actually performing right
// now rather than just who has the highest coach rating. Clicking a player
// opens their match-by-match development; the dropdown inside adds more
// players for a comparison. Used for both Kampscore and Statistik — Statistik
// (withFilters) adds filters on player, position and udviklingstrin, and a
// "gennemsnit" view that averages the chosen players per match.
function PlayerStatsView({ players, config, withFilters = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [plans, setPlans] = useState([]);
  const [statsSummary, setStatsSummary] = useState({});
  const [statsById, setStatsById] = useState({}); // playerId -> { matches }
  const [sortMode, setSortMode] = useState("avg");
  // Players picked by hand for the details panel, in pick order (decides the
  // colour). null = nobody picked: on Statistik the charts then follow the
  // filters (everyone they leave in the table); on Kampscore there are none.
  const [manualIds, setManualIds] = useState(null);
  const [onlySelected, setOnlySelected] = useState(false);
  // "each" = one line per player, "avg" = one line averaging them per match,
  // "auto" = one line per player while there are few enough, else the average.
  const [chartMode, setChartMode] = useState("auto");
  // Statistik filters (empty = no restriction).
  const [filterPlayers, setFilterPlayers] = useState([]);
  const [filterPositions, setFilterPositions] = useState([]);
  const [filterLevels, setFilterLevels] = useState([]);
  // Statistik: which charts to draw, and this coach's saved setups.
  const [visibleCharts, setVisibleCharts] = useState(KAMP_DEFAULT_CHART_KEYS);
  const [savedViews, setSavedViews] = useState([]);
  const [appliedViewId, setAppliedViewId] = useState("");
  const [saveNameOpen, setSaveNameOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [viewsMessage, setViewsMessage] = useState("");
  const panelRef = React.useRef(null);

  useEffect(() => {
    if (!withFilters) return;
    api
      .getStatisticsViews()
      .then(setSavedViews)
      .catch(() => setViewsMessage("Kunne ikke hente dine gemte opsætninger."));
  }, [withFilters]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [planList, summary, matchRows] = await Promise.all([
          api.getMatchPlans(),
          api.getMatchStatsSummary(),
          api.getMatchStatsByMatch(),
        ]);
        const byPlayer = {};
        matchRows.forEach((r) => {
          if (!byPlayer[r.playerId]) byPlayer[r.playerId] = { matches: [] };
          byPlayer[r.playerId].matches.push(r);
        });
        setPlans(planList);
        setStatsSummary(summary);
        setStatsById(byPlayer);
        setError(false);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scrollToPanel = () =>
    setTimeout(() => {
      if (panelRef.current) panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

  const gamesByPlayer = {};
  plans.forEach((p) => {
    const division = p.division || "Uden række";
    const weight = KAMPPLAN_DIVISION_WEIGHTS[p.division] ?? 1;
    Object.entries(p.performanceScores || {}).forEach(([playerId, score]) => {
      if (typeof score !== "number") return;
      if (!gamesByPlayer[playerId]) gamesByPlayer[playerId] = [];
      gamesByPlayer[playerId].push({ score, weight, division });
    });
  });

  // Each game's score is scaled by its række weight before averaging — the
  // divisor is the game count, not the summed weight, so the weight actually
  // shows up in the result even for a player who has only played at one
  // level (dividing by summed weight instead would cancel it right back
  // out, e.g. every Liga 2 score / 0.8 total weight = the unweighted
  // average again, defeating the point).
  const rows = players.map((player) => {
    const games = gamesByPlayer[player.id] || [];
    const avg = games.length
      ? games.reduce((sum, g) => sum + g.score * g.weight, 0) / games.length
      : null;
    // Breakdown of how many of those games were at each level, always all
    // three (even 0), in KAMPPLAN_DIVISIONS order — so a coach can see why
    // the weighting pulled the average where it did.
    const levelCounts = {};
    games.forEach((g) => {
      levelCounts[g.division] = (levelCounts[g.division] || 0) + 1;
    });
    const levelBreakdown = KAMPPLAN_DIVISIONS.map((d) => ({
      division: d,
      count: levelCounts[d] || 0,
    }));
    return {
      player,
      gameCount: games.length,
      levelBreakdown,
      avg,
      stats: statsSummary[player.id] || null,
    };
  });

  // ---- Statistik filters
  const levels = [...((config && config.participationLevels) || [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  const levelName = (player) => {
    const l = levels.find((x) => x.id === player.participationLevelId);
    return l ? l.name : "";
  };
  const anyWithoutLevel = players.some((pl) => !pl.participationLevelId);
  const filtersActive = filterPlayers.length + filterPositions.length + filterLevels.length > 0;
  const passesFilters = (pl) =>
    (filterPlayers.length === 0 || filterPlayers.includes(pl.id)) &&
    (filterPositions.length === 0 ||
      filterPositions.includes(pl.primaryPosition) ||
      filterPositions.includes(pl.secondaryPosition)) &&
    (filterLevels.length === 0 || filterLevels.includes(pl.participationLevelId || KAMP_UNSET_LEVEL));
  // Changing a filter hands the charts back to the filters (drops any hand-picked players).
  const toggleIn = (list, setList) => (value) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setManualIds(null);
  };
  const clearList = (setList) => () => {
    setList([]);
    setManualIds(null);
  };
  const resetFilters = () => {
    setFilterPlayers([]);
    setFilterPositions([]);
    setFilterLevels([]);
    setManualIds(null);
  };
  const playerOptions = [...players]
    .sort((a, b) => a.name.localeCompare(b.name, "da"))
    .map((pl) => ({ value: pl.id, label: pl.name }));
  const positionOptions = POSITION_CATALOG.map((pos) => ({ value: pos.id, label: `${pos.id} · ${pos.label}` }));
  const levelOptions = [
    ...levels.map((l) => ({ value: l.id, label: l.name })),
    ...(anyWithoutLevel ? [{ value: KAMP_UNSET_LEVEL, label: "Ikke angivet" }] : []),
  ];
  const filterText = (label, selected, options) => {
    if (selected.length === 0) return `${label}: alle`;
    if (selected.length === 1) return `${label}: ${(options.find((o) => o.value === selected[0]) || {}).label || ""}`;
    return `${label}: ${selected.length} valgt`;
  };

  const sortedRows =
    sortMode === "avg"
      ? [...rows].sort((a, b) => (b.avg ?? -Infinity) - (a.avg ?? -Infinity))
      : [...rows].sort((a, b) => a.player.name.localeCompare(b.player.name, "da"));
  const filteredRows = withFilters ? sortedRows.filter((r) => passesFilters(r.player)) : sortedRows;

  // ---- who is in the charts
  // Hand-picked players win; otherwise, on Statistik, everyone the filters
  // leave in the table is charted automatically (nothing until a filter is set).
  const autoIds = withFilters && filtersActive ? filteredRows.map((r) => r.player.id) : [];
  const selectedIds = manualIds ?? autoIds;
  const effectiveMode =
    chartMode === "auto" ? (selectedIds.length > KAMP_COMPARE_MAX ? "avg" : "each") : chartMode;
  // One line per player is limited to the palette; the rest still count in the table.
  const chartIds = effectiveMode === "each" ? selectedIds.slice(0, KAMP_COMPARE_MAX) : selectedIds;
  const truncated = effectiveMode === "each" && selectedIds.length > KAMP_COMPARE_MAX;

  const toggleSelected = (playerId) =>
    setManualIds(
      selectedIds.includes(playerId) ? selectedIds.filter((id) => id !== playerId) : [...selectedIds, playerId]
    );
  // Luk closes the panel and keeps it closed until the filters change or
  // "Vis udvikling for de viste" is pressed.
  const closePanel = () => {
    setManualIds([]);
    setOnlySelected(false);
  };
  // A click on a table row opens the details for just that player; more
  // players are added from the dropdown inside the panel.
  const openPlayer = (playerId) => {
    setManualIds([playerId]);
    scrollToPanel();
  };
  // Open the details for everyone the table is showing right now.
  const showShown = () => {
    const ids = filteredRows.map((r) => r.player.id);
    if (ids.length === 0) return;
    setManualIds(ids);
    setChartMode("auto");
    scrollToPanel();
  };

  // ---- Statistik: which charts, and saved setups
  const chartOptions = KAMP_ALL_CHARTS.map((c) => ({ value: c.key, label: c.title, group: c.group }));
  // Keeps the charts in the dropdown's order, whatever order they were ticked in.
  const toggleChart = (key) =>
    setVisibleCharts(
      visibleCharts.includes(key)
        ? visibleCharts.filter((k) => k !== key)
        : KAMP_ALL_CHART_KEYS.filter((k) => k === key || visibleCharts.includes(k))
    );
  const shownCharts = withFilters ? KAMP_ALL_CHARTS.filter((c) => visibleCharts.includes(c.key)) : KAMP_TREND_CHARTS;
  const appliedView = savedViews.find((v) => v.id === appliedViewId) || null;
  const currentConfig = () => ({
    filterPlayers,
    filterPositions,
    filterLevels,
    charts: visibleCharts,
    chartMode,
    sortMode,
    selectedIds: manualIds,
  });
  // Saved setups can mention players/levels/charts that no longer exist; drop those.
  const applyView = (id) => {
    setAppliedViewId(id);
    setViewsMessage("");
    const v = savedViews.find((x) => x.id === id);
    if (!v) return;
    const c = v.config || {};
    const playerIds = new Set(players.map((pl) => pl.id));
    const levelIds = new Set([...levels.map((l) => l.id), KAMP_UNSET_LEVEL]);
    const positionIds = new Set(POSITION_CATALOG.map((pos) => pos.id));
    const chartKeys = KAMP_ALL_CHART_KEYS;
    setFilterPlayers((c.filterPlayers || []).filter((x) => playerIds.has(x)));
    setFilterPositions((c.filterPositions || []).filter((x) => positionIds.has(x)));
    setFilterLevels((c.filterLevels || []).filter((x) => levelIds.has(x)));
    const charts = (c.charts || []).filter((k) => chartKeys.includes(k));
    setVisibleCharts(charts.length ? chartKeys.filter((k) => charts.includes(k)) : KAMP_DEFAULT_CHART_KEYS);
    setChartMode(c.chartMode || "auto");
    setSortMode(c.sortMode || "avg");
    setManualIds(Array.isArray(c.selectedIds) ? c.selectedIds.filter((x) => playerIds.has(x)) : null);
    setOnlySelected(false);
  };
  const saveView = async () => {
    const name = saveName.trim();
    if (!name) {
      setViewsMessage("Skriv et navn til opsætningen.");
      return;
    }
    try {
      const saved = await api.saveStatisticsView({ name, config: currentConfig() });
      setSavedViews((list) =>
        [...list.filter((v) => v.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name, "da"))
      );
      setAppliedViewId(saved.id);
      setSaveNameOpen(false);
      setViewsMessage(`Gemt som "${saved.name}".`);
    } catch (e) {
      setViewsMessage(e.message || "Kunne ikke gemme opsætningen.");
    }
  };
  const deleteView = async () => {
    if (!appliedView) return;
    if (!window.confirm(`Slet opsætningen "${appliedView.name}"?`)) return;
    try {
      await api.deleteStatisticsView(appliedView.id);
      setSavedViews((list) => list.filter((v) => v.id !== appliedView.id));
      setAppliedViewId("");
      setViewsMessage("Opsætningen er slettet.");
    } catch (e) {
      setViewsMessage("Kunne ikke slette opsætningen.");
    }
  };

  // ---- per-match data for the charts
  const planById = {};
  plans.forEach((pl) => {
    planById[pl.id] = pl;
  });
  const divisionWeight = (division) => KAMPPLAN_DIVISION_WEIGHTS[division] ?? 1;
  // The matches one player has a rating and/or tracking stats for.
  const matchesFor = (playerId) => {
    const byId = {};
    ((statsById[playerId] && statsById[playerId].matches) || []).forEach((m) => {
      const plan = planById[m.matchPlanId];
      byId[m.matchPlanId] = {
        id: m.matchPlanId,
        date: m.matchDate,
        opponent: m.opponent,
        division: plan ? plan.division : "",
        score:
          plan && typeof (plan.performanceScores || {})[playerId] === "number"
            ? plan.performanceScores[playerId] * divisionWeight(plan.division)
            : null,
        ...Object.fromEntries(KAMP_STAT_KEYS.map((k) => [k, m[k]])),
        teamMax: m.teamMax || {},
      };
    });
    plans.forEach((pl) => {
      const score = (pl.performanceScores || {})[playerId];
      if (typeof score === "number" && !byId[pl.id]) {
        byId[pl.id] = {
          id: pl.id,
          date: pl.date,
          opponent: pl.opponent,
          division: pl.division,
          score: score * divisionWeight(pl.division),
        };
      }
    });
    return Object.values(byId);
  };

  // The value to chart for one match, or null when the match has nothing
  // real to show for it: the stat is empty, or it is a 0 that really means
  // "not recorded" — 0 for the whole squad in that match, a pass percentage
  // with no passes behind it, or 0 km although the player was on the pitch.
  const trendValue = (m, key) => {
    const raw = m[key];
    if (raw == null || raw === "" || isNaN(Number(raw))) return null;
    const v = Number(raw);
    // A percentage with nothing behind it (no passes / no attempts) isn't 0%.
    if (key === "passSuccessPct") return Number(m.passes) > 0 ? v : null;
    if (key === "conversionRate") return Number(m.totalAttempts) > 0 ? v : null;
    if ((key === "distanceKm" || key === "minutes") && v === 0) return null;
    if (v === 0 && !KAMP_RARE_STATS.has(key) && m.teamMax && Number(m.teamMax[key]) === 0) return null;
    return v;
  };

  const compare = chartIds
    .map((id, idx) => ({
      id,
      player: players.find((pl) => pl.id === id),
      color: KAMP_COMPARE_COLORS[idx % KAMP_COMPARE_COLORS.length],
    }))
    .filter((c) => c.player)
    .map((c) => ({ ...c, matches: matchesFor(c.id) }));
  const averaging = effectiveMode === "avg" && compare.length > 0;
  const series = averaging
    ? [{ id: "avg", name: `Gennemsnit (${compare.length} spillere)`, color: "#1A1A1A" }]
    : compare.map((c) => ({ id: c.id, name: c.player.name, color: c.color }));

  // Every match any chosen player has data for, oldest first, so all lines
  // share one date axis.
  const allMatchesById = {};
  compare.forEach((c) =>
    c.matches.forEach((m) => {
      if (!allMatchesById[m.id]) {
        allMatchesById[m.id] = { id: m.id, date: m.date, opponent: m.opponent, division: m.division };
      }
    })
  );
  const allMatches = Object.values(allMatchesById).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const spansYears = new Set(allMatches.map((m) => String(m.date).slice(0, 4))).size > 1;
  const matchLabel = (iso) => {
    const dt = new Date(`${iso}T00:00:00`);
    if (isNaN(dt.getTime())) return String(iso);
    return dt.toLocaleDateString(
      "da-DK",
      spansYears ? { day: "numeric", month: "short", year: "2-digit" } : { day: "numeric", month: "short" }
    );
  };
  // One chart's points: only the matches where at least one chosen player has
  // a real value for that measure — a match with nothing is left out, not 0.
  // In average mode each point is the mean of the players who have a value.
  const chartPoints = (key) =>
    allMatches
      .map((m) => {
        const perPlayer = compare.map((c) => {
          const pm = c.matches.find((x) => x.id === m.id);
          return { id: c.id, value: pm ? trendValue(pm, key) : null };
        });
        const vals = {};
        if (averaging) {
          const have = perPlayer.filter((x) => x.value !== null);
          vals.v_avg = have.length ? have.reduce((sum, x) => sum + x.value, 0) / have.length : null;
          vals.n_avg = have.length || null;
        } else {
          perPlayer.forEach((x) => {
            vals[`v_${x.id}`] = x.value;
          });
        }
        return { m, vals };
      })
      .filter((x) => Object.keys(x.vals).some((k) => k.startsWith("v_") && x.vals[k] !== null))
      .map((x, i) => ({
        i,
        label: matchLabel(x.m.date),
        date: x.m.date,
        opponent: x.m.opponent,
        division: x.m.division,
        weight: divisionWeight(x.m.division),
        ...x.vals,
      }));

  const visibleRows =
    onlySelected && selectedIds.length > 0
      ? filteredRows.filter((r) => selectedIds.includes(r.player.id))
      : filteredRows;
  // The details dropdown offers the players that pass the filters (plus any
  // already chosen, so nobody disappears from under the ticks).
  const pickerOptions = playerOptions
    .filter((o) => {
      const pl = players.find((x) => x.id === o.value);
      return selectedIds.includes(o.value) || !withFilters || (pl && passesFilters(pl));
    })
    .map((o) => {
      const idx = selectedIds.indexOf(o.value);
      return { ...o, color: idx >= 0 && !averaging ? KAMP_COMPARE_COLORS[idx % KAMP_COMPARE_COLORS.length] : undefined };
    });

  const title = withFilters ? "Statistik" : "Kampscore";
  const colCount = withFilters ? 9 : 7;

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>{title}</h1>
          <p style={styles.subtext}>
            Spillernes kampindsats over tid, bedømt 1-5 efter hver kamp på Kampplan, sammen med
            gennemsnitlig sporingsstatistik fra kampene. Kampscoren vægtes efter kampens række
            (Division ×1,2, Liga 1 ×1, Liga 2 ×0,8). Bruges til at vurdere hvem der reelt præsterer
            bedst lige nu. Klik på en spiller for at se udviklingen fra kamp til kamp. I detaljerne kan du
            tilføje flere spillere og sammenligne dem.
            {withFilters &&
              " Brug filtrene til at begrænse listen til bestemte spillere, positioner eller udviklingstrin, og se gruppens gennemsnit kamp for kamp."}
          </p>
        </div>
      </div>

      {withFilters && (
        <div style={{ ...styles.categoryBlock, padding: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ ...styles.fieldLabel, margin: 0 }}>Filter</span>
            <MultiSelectDropdown
              buttonText={filterText("Spillere", filterPlayers, playerOptions)}
              options={playerOptions}
              selected={filterPlayers}
              onToggle={toggleIn(filterPlayers, setFilterPlayers)}
              onClear={clearList(setFilterPlayers)}
              searchable
            />
            <MultiSelectDropdown
              buttonText={filterText("Position", filterPositions, positionOptions)}
              options={positionOptions}
              selected={filterPositions}
              onToggle={toggleIn(filterPositions, setFilterPositions)}
              onClear={clearList(setFilterPositions)}
              minWidth={170}
            />
            <MultiSelectDropdown
              buttonText={filterText("Udviklingstrin", filterLevels, levelOptions)}
              options={levelOptions}
              selected={filterLevels}
              onToggle={toggleIn(filterLevels, setFilterLevels)}
              onClear={clearList(setFilterLevels)}
              minWidth={200}
            />
            {filtersActive && (
              <button style={styles.linkBtn} onClick={resetFilters}>
                <X size={12} /> Nulstil filtre
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
            <span style={{ ...styles.fieldLabel, margin: 0 }}>Grafer</span>
            <MultiSelectDropdown
              buttonText={`Grafer: ${visibleCharts.length} af ${KAMP_ALL_CHARTS.length}`}
              options={chartOptions}
              selected={visibleCharts}
              onToggle={toggleChart}
              onClear={() => setVisibleCharts(KAMP_DEFAULT_CHART_KEYS)}
              clearLabel="Tilbage til standardgrafer"
              alwaysShowClear
              searchable
              minWidth={190}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
            <span style={{ ...styles.fieldLabel, margin: 0 }}>Opsætning</span>
            <select
              style={{ ...styles.select, width: "auto", minWidth: 200 }}
              value={appliedViewId}
              onChange={(e) => applyView(e.target.value)}
              aria-label="Gemte opsætninger"
            >
              <option value="">{savedViews.length ? "Vælg en gemt opsætning…" : "Ingen gemte opsætninger"}</option>
              {savedViews.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {saveNameOpen ? (
              <>
                <input
                  style={{ ...styles.input, width: 200 }}
                  placeholder="Navn på opsætning"
                  value={saveName}
                  maxLength={60}
                  autoFocus
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveView();
                    if (e.key === "Escape") setSaveNameOpen(false);
                  }}
                />
                <button style={styles.primaryBtnSm} onClick={saveView}>
                  Gem
                </button>
                <button style={{ ...styles.ghostBtn, padding: "8px 14px", fontSize: 13 }} onClick={() => setSaveNameOpen(false)}>
                  Annuller
                </button>
              </>
            ) : (
              <>
                <button
                  style={styles.teamFilterChip}
                  onClick={() => {
                    setSaveName(appliedView ? appliedView.name : "");
                    setSaveNameOpen(true);
                    setViewsMessage("");
                  }}
                >
                  Gem opsætning
                </button>
                {appliedView && (
                  <button style={{ ...styles.linkBtn, color: "#E2231A" }} onClick={deleteView}>
                    <X size={12} /> Slet "{appliedView.name}"
                  </button>
                )}
              </>
            )}
            {viewsMessage && <span style={{ ...styles.subtext, fontSize: 12 }}>{viewsMessage}</span>}
          </div>
          <p style={{ ...styles.subtext, margin: "8px 0 0", fontSize: 12 }}>
            {filteredRows.length} af {rows.length} spillere vises. En spiller tæller med på en position, hvis det er
            hendes primære eller sekundære position. De viste spillere tegnes automatisk i graferne.
          </p>
        </div>
      )}

      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          style={{ ...styles.teamFilterChip, ...(sortMode === "avg" ? styles.teamFilterChipActive : {}) }}
          onClick={() => setSortMode("avg")}
        >
          <ArrowUpDown size={14} /> Sortér efter gennemsnit
        </button>
        <button
          style={{ ...styles.teamFilterChip, ...(sortMode === "alpha" ? styles.teamFilterChipActive : {}) }}
          onClick={() => setSortMode("alpha")}
        >
          <ArrowUpDown size={14} /> Sortér alfabetisk
        </button>
        {selectedIds.length > 0 && (
          <button
            style={{ ...styles.teamFilterChip, ...(onlySelected ? styles.teamFilterChipActive : {}) }}
            onClick={() => setOnlySelected((v) => !v)}
          >
            <Check size={14} /> Vis kun valgte ({selectedIds.length})
          </button>
        )}
        {withFilters && filteredRows.length > 0 && (
          <button style={styles.teamFilterChip} onClick={showShown}>
            <TrendingUp size={14} /> Vis udvikling for de viste ({filteredRows.length})
          </button>
        )}
      </div>

      {loading && <p style={styles.subtext}>Indlæser…</p>}
      {error && <div style={styles.errorBannerRow}>Kunne ikke hente kampplaner.</div>}

      {!loading && !error && selectedIds.length > 0 && (
        <div ref={panelRef} style={{ ...styles.categoryBlock, scrollMarginTop: 110 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={styles.categoryLabel}>
              {averaging
                ? "Gennemsnit kamp for kamp"
                : selectedIds.length === 1
                ? "Udvikling kamp for kamp"
                : "Sammenligning kamp for kamp"}
            </span>
            <MultiSelectDropdown
              buttonText={`Vælg spillere (${selectedIds.length} valgt)`}
              options={pickerOptions}
              selected={selectedIds}
              onToggle={toggleSelected}
              searchable
              minWidth={210}
            />
            <button
              style={{ ...styles.ghostBtn, padding: "8px 14px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}
              onClick={closePanel}
              title="Luk og fjern alle valg"
            >
              <X size={14} /> Luk
            </button>
          </div>
          {withFilters && selectedIds.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {[
                { key: "each", label: "Hver spiller" },
                { key: "avg", label: "Gennemsnit" },
              ].map((m) => (
                <button
                  key={m.key}
                  style={{ ...styles.teamFilterChip, ...(effectiveMode === m.key ? styles.teamFilterChipActive : {}) }}
                  onClick={() => setChartMode(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
          {!averaging && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }}>
              {compare.map((c) => (
                <span
                  key={c.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 6px 4px 10px",
                    borderRadius: 16,
                    border: `2px solid ${c.color}`,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {c.player.name}
                  <button
                    style={{ ...styles.iconBtnGhost, padding: 2 }}
                    onClick={() => toggleSelected(c.id)}
                    title={`Fjern ${c.player.name}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {truncated && (
            <p style={{ ...styles.subtext, color: "#7A4B00", margin: "0 0 8px" }}>
              Med én linje pr. spiller vises de første {KAMP_COMPARE_MAX} af {selectedIds.length} spillere. Skift til
              Gennemsnit for at få alle med.
            </p>
          )}
          <p style={{ ...styles.subtext, margin: averaging ? "10px 0 12px" : "0 0 12px" }}>
            {averaging
              ? `Gennemsnit af ${compare.length} spillere: ${compare.map((c) => c.player.name).join(", ")}. `
              : ""}
            {allMatches.length} kamp{allMatches.length === 1 ? "" : "e"} med score eller statistik. Punkterne står i den
            rækkefølge, kampene blev spillet, med datoen under. Kampscoren er vægtet efter kampens række (Division ×1,2,
            Liga 1 ×1, Liga 2 ×0,8), ligesom gennemsnittet i tabellen. Mangler en spiller en værdi i en kamp,
            {averaging ? " tæller hun ikke med i den kamps gennemsnit." : " springes den over i hendes linje."}
          </p>
          {!averaging && series.length > 1 && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10, fontSize: 12 }}>
              {series.map((s) => (
                <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 16, height: 3, background: s.color, display: "inline-block", borderRadius: 2 }} />
                  {s.name}
                </span>
              ))}
            </div>
          )}
          {allMatches.length === 0 ? (
            <p style={styles.noSkills}>
              Ingen kampe med score eller statistik for {selectedIds.length === 1 ? "denne spiller" : "de valgte spillere"} endnu.
            </p>
          ) : shownCharts.length === 0 ? (
            <p style={styles.noSkills}>Ingen grafer er valgt. Vælg dem under Grafer ovenfor.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 12 }}>
              {shownCharts.map((c) => (
                <MatchTrendChart
                  key={c.key}
                  title={c.title}
                  unit={c.unit}
                  decimals={c.decimals || 0}
                  domain={c.domain}
                  ticks={c.ticks}
                  series={series}
                  weighted={Boolean(c.weighted)}
                  points={chartPoints(c.key)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && (
        <div style={{ ...styles.categoryBlock, padding: 0, overflowX: "auto" }}>
          <table style={styles.kpsTable}>
            <thead>
              <tr>
                <th style={styles.kpsTh}>Spiller</th>
                {withFilters && <th style={styles.kpsTh}>Pos.</th>}
                {withFilters && <th style={styles.kpsTh}>Trin</th>}
                <th style={{ ...styles.kpsTh, textAlign: "center" }}>Kampscore</th>
                <th style={{ ...styles.kpsTh, textAlign: "right" }}>Pasningsfuldførelse</th>
                <th style={{ ...styles.kpsTh, textAlign: "right" }}>High intensity runs</th>
                <th style={{ ...styles.kpsTh, textAlign: "right" }}>Km dækket</th>
                <th style={{ ...styles.kpsTh, textAlign: "right" }}>Driblinger</th>
                <th style={{ ...styles.kpsTh, textAlign: "right" }}>Taklinger</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ player, gameCount, levelBreakdown, avg, stats }) => {
                const picked = selectedIds.includes(player.id);
                return (
                  <tr
                    key={player.id}
                    style={{
                      ...styles.kpsRow,
                      cursor: "pointer",
                      ...(picked ? { background: "#F6F3EC" } : {}),
                    }}
                    onClick={() => openPlayer(player.id)}
                    title="Klik for at se udviklingen kamp for kamp"
                  >
                    <td style={styles.kpsTd}>
                      <div style={{ fontWeight: 600 }}>{player.name}</div>
                      <div style={{ fontSize: 12, color: "#8A8A8A" }}>
                        {gameCount === 0
                          ? "Ingen kampscore endnu"
                          : levelBreakdown.map((l) => `${l.division}: ${l.count}`).join(", ")}
                      </div>
                    </td>
                    {withFilters && (
                      <td style={styles.kpsTd}>
                        {[player.primaryPosition, player.secondaryPosition].filter(Boolean).join(" / ") || "—"}
                      </td>
                    )}
                    {withFilters && <td style={styles.kpsTd}>{levelName(player) || "—"}</td>}
                    <td style={{ ...styles.kpsTd, textAlign: "center" }}>
                      <span
                        style={{
                          ...styles.readOnlyScorePill,
                          // Weighting can push the average slightly outside the
                          // raw 1-5 rating scale (e.g. a Division 5 -> 6.0);
                          // clamp so the badge still maps to a real score
                          // color instead of falling through to neutral grey.
                          background: scoreColor(
                            avg != null ? Math.min(5, Math.max(1, Math.round(avg))) : null
                          ),
                        }}
                      >
                        {avg != null ? avg.toFixed(1) : "—"}
                      </span>
                    </td>
                    <td style={{ ...styles.kpsTd, textAlign: "right" }}>
                      {stats?.avgPassSuccessPct != null ? `${stats.avgPassSuccessPct.toFixed(0)}%` : "—"}
                    </td>
                    <td style={{ ...styles.kpsTd, textAlign: "right" }}>
                      {stats?.avgHighIntensityRuns != null ? stats.avgHighIntensityRuns.toFixed(1) : "—"}
                    </td>
                    <td style={{ ...styles.kpsTd, textAlign: "right" }}>
                      {stats?.avgDistanceKm != null ? `${stats.avgDistanceKm.toFixed(1)} km` : "—"}
                    </td>
                    <td style={{ ...styles.kpsTd, textAlign: "right" }}>
                      {stats?.avgDribbles != null ? stats.avgDribbles.toFixed(1) : "—"}
                    </td>
                    <td style={{ ...styles.kpsTd, textAlign: "right" }}>
                      {stats?.avgTackles != null ? stats.avgTackles.toFixed(1) : "—"}
                    </td>
                  </tr>
                );
              })}
              {visibleRows.length === 0 && (
                <tr>
                  <td style={{ ...styles.kpsTd, color: "#6B6B6B" }} colSpan={colCount}>
                    Ingen spillere matcher filtrene.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KampplanView({ data }) {
  const players = data.players;
  const [subView, setSubView] = useState("list");
  const [loading, setLoading] = useState(true);
  const [planIndex, setPlanIndex] = useState([]);
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [formations, setFormations] = useState([]);

  // The pitch is an extra on top of the position tables, so a failed load
  // just means no pitch — it must not block the Kampplan itself.
  useEffect(() => {
    api.getFormations().then(setFormations).catch(() => setFormations([]));
  }, []);

  const loadIndex = async () => {
    setLoading(true);
    try {
      const list = await api.getMatchPlans();
      setPlanIndex(list);
      setError(false);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setPlan(kpEmptyPlan());
    setSubView("editor");
  };

  const openEdit = async (id) => {
    try {
      const full = await api.getMatchPlan(id);
      setPlan(full);
      setSubView("editor");
    } catch (e) {
      setError(true);
    }
  };

  const openCopy = async (id) => {
    try {
      const full = await api.getMatchPlan(id);
      // A copy is a new match with its own id, so it must start with no
      // performance ratings — those belong to the match they were entered
      // for, not to the plan's other fields. (The server won't persist
      // performanceScores from this body either way; this just keeps the
      // local draft honest before it's even saved.) Same for shareToken:
      // it belongs to the original plan's link, not this draft — carrying
      // it over would make KpShareLinkCard show a link that actually still
      // points at the original match until this copy is saved and a fresh
      // token is generated for it.
      setPlan({ ...full, id: null, opponent: "", date: todayStr(), performanceScores: {}, shareToken: null });
      setSubView("editor");
    } catch (e) {
      setError(true);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Slet denne kampplan? Det kan ikke fortrydes.")) return;
    try {
      await api.deleteMatchPlan(id);
      loadIndex();
    } catch (e) {
      setError(true);
    }
  };

  const printById = async (id) => {
    try {
      const full = await api.getMatchPlan(id);
      kpPrintPlan(full);
    } catch (e) {
      setError(true);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (plan.id) {
        await api.updateMatchPlan(plan.id, plan);
      } else {
        await api.createMatchPlan(plan);
      }
      setError(false);
      setSubView("list");
      loadIndex();
    } catch (e) {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {error && (
        <div style={styles.errorBanner}>Kunne ikke gemme/hente kampplanen — tjek din forbindelse og prøv igen.</div>
      )}
      {loading ? (
        <p style={styles.subtext}>Indlæser kampplaner …</p>
      ) : subView === "list" ? (
        <KampplanList
          planIndex={planIndex}
          onNew={openNew}
          onEdit={openEdit}
          onCopy={openCopy}
          onDelete={remove}
          onPrint={printById}
        />
      ) : (
        <KampplanEditor
          plan={plan}
          setPlan={setPlan}
          onBack={() => setSubView("list")}
          onSave={save}
          onPrint={kpPrintPlan}
          saving={saving}
          players={players}
          data={data}
          formations={formations}
        />
      )}
    </div>
  );
}

// Width of the app's content column (header, menu bar, back bar and main all share it).
// Wide enough to use a full-screen desktop browser without much scrolling; on a
// phone the column simply fills the screen.
const APP_MAX_WIDTH = 1280;

const styles = {
  app: {
    minHeight: "100vh",
    background: "#F7F7F5",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#1A1A1A",
    paddingBottom: 60,
  },
  loadingWrap: {
    minHeight: "100vh",
    background: "#111111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  authWrap: {
    minHeight: "100vh",
    background: "#111111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 20,
  },
  authCard: {
    width: "100%",
    maxWidth: 380,
    background: "#FFFFFF",
    borderRadius: 14,
    padding: "28px 26px",
    boxSizing: "border-box",
  },
  authTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 6px",
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 13,
    color: "#6B6B6B",
    textAlign: "center",
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
  claimCoachBtn: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "#F6F3EC",
    border: "1px solid #D9D4C7",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 5,
  },
  headerTopBar: {
    background: "#FFFFFF",
    borderBottom: "1px solid #E3E3E3",
  },
  headerTopRow: {
    maxWidth: APP_MAX_WIDTH,
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  brand: {
    display: "flex",
    flexDirection: "column",
  },
  brandText: {
    color: "#111111",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 17,
    letterSpacing: 1.5,
    fontWeight: 700,
  },
  brandSub: {
    color: "#6B6B6B",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: 0.3,
  },
  logoImg: {
    width: 40,
    height: 40,
    objectFit: "contain",
    flexShrink: 0,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "1px solid #D9D4C7",
    borderRadius: 8,
    padding: "6px 10px",
    color: "#4A4A4A",
    cursor: "pointer",
  },
  coachNameTag: {
    fontSize: 12,
    fontWeight: 600,
  },
  headerNavBar: {
    background: "#111111",
  },
  headerNavBarRow: {
    maxWidth: APP_MAX_WIDTH,
    margin: "0 auto",
    padding: "8px 20px",
    display: "flex",
    justifyContent: "flex-end",
  },
  menuTriggerBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: "transparent",
    color: "#C9C9C9",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.3,
    cursor: "pointer",
  },
  menuBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 9,
  },
  menuDropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
    padding: 6,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 210,
    zIndex: 10,
  },
  menuDropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 7,
    border: "none",
    background: "transparent",
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  menuDropdownItemActive: {
    background: "#E2231A",
    color: "#FFFFFF",
  },
  headerStripes: {
    height: 4,
    background:
      "repeating-linear-gradient(90deg, #E2231A 0px, #E2231A 40px, #111111 40px, #111111 80px)",
  },
  main: {
    maxWidth: APP_MAX_WIDTH,
    margin: "0 auto",
    padding: "28px 20px",
  },
  errorBanner: {
    background: "#F4E0DD",
    color: "#8A3A31",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  successBanner: {
    background: "#E4EEE0",
    color: "#2F5D46",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  errorBannerRow: {
    background: "#F4E0DD",
    color: "#8A3A31",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  selectActionBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#F3EBDA",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#5A4A25",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  sectionHeadRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  h1: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 26,
    letterSpacing: 0.5,
    margin: 0,
    color: "#111111",
  },
  subtext: {
    color: "#6B6B6B",
    fontSize: 14,
    margin: "4px 0 0",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#111111",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  primaryBtnSm: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#111111",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  compareBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#FFFFFF",
    color: "#111111",
    border: "1px solid #D9D4C7",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  compareBtnActive: {
    background: "#E2231A",
    color: "#FFFFFF",
    borderColor: "#E2231A",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #D9D4C7",
    color: "#1A1A1A",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  dangerBtn: {
    background: "#E2231A",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  addCard: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  addCardCol: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: "#6B6B6B",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  positionGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  positionChip: {
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  positionRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  collapseHeaderBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },
  linkBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#111111",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  linkBtnDanger: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#E2231A",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  positionEditCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    minWidth: 140,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #D9D4C7",
    fontSize: 14,
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #D9D4C7",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: 64,
    boxSizing: "border-box",
  },
  rtToolbar: {
    display: "flex",
    gap: 4,
    padding: 6,
    border: "1px solid #D9D4C7",
    borderBottom: "none",
    borderRadius: "8px 8px 0 0",
    background: "#F6F3EC",
  },
  rtBtn: {
    minWidth: 28,
    height: 28,
    padding: "0 8px",
    borderRadius: 6,
    border: "1px solid transparent",
    background: "transparent",
    color: "#1A1A1A",
    fontSize: 13,
    cursor: "pointer",
  },
  rtEditable: {
    width: "100%",
    minHeight: 220,
    maxHeight: 480,
    overflowY: "auto",
    padding: "10px 12px",
    borderRadius: "0 0 8px 8px",
    border: "1px solid #D9D4C7",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #D9D4C7",
    fontSize: 14,
    fontFamily: "inherit",
    background: "#FFFFFF",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
    background: "#FFFFFF",
    borderRadius: 10,
    border: "1px dashed #D9D4C7",
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 14,
  },
  playerCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    cursor: "pointer",
  },
  playerCardSelected: {
    borderColor: "#111111",
    boxShadow: "0 0 0 2px #111111",
  },
  playerCardDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  playerCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#111111",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 14,
    fontWeight: 600,
  },
  numberBadgeLg: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#111111",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 18,
    fontWeight: 600,
    flexShrink: 0,
  },
  overallPill: {
    color: "#FFFFFF",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
  },
  playerName: {
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 2,
  },
  playerPos: {
    color: "#6B6B6B",
    fontSize: 13,
    marginBottom: 12,
  },
  miniBars: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  miniBarTrack: {
    height: 5,
    background: "#EFEFEF",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  evalCountTag: {
    marginTop: 10,
    fontSize: 11,
    color: "#B9B2A0",
    fontWeight: 600,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#111111",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    padding: "6px 0",
    marginBottom: 12,
  },
  // Player page only (see PlayerView) — a long page with a lot to scroll
  // past (Indstillinger, categories, development plan), so the back
  // button stays pinned at the top instead of needing a scroll back up.
  // The app background color (not transparent) is required here so
  // scrolled-past content doesn't show through underneath it.
  // Full viewport width (the "calc(50% - 50vw)" margin trick breaks out of
  // main's centered maxWidth:900 column) so the grey background reaches
  // both edges of the screen, not just the content column. `top` is set
  // inline per-render to the app header's actual measured height (see
  // PlayerView) since the header wraps differently at different widths.
  backBarSticky: {
    position: "sticky",
    background: "#F7F7F5",
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginBottom: 4,
    zIndex: 4,
  },
  backBtnInBar: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#111111",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    maxWidth: APP_MAX_WIDTH,
    margin: "0 auto",
    padding: "10px 20px",
    boxSizing: "border-box",
    width: "100%",
  },
  playerHeadRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  iconDangerBtn: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    color: "#E2231A",
    borderRadius: 8,
    padding: 8,
    cursor: "pointer",
  },
  evalBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  evalTabs: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
    minWidth: 0,
  },
  evalTab: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },
  evalTabActive: {
    background: "#E2231A",
    borderColor: "#E2231A",
    color: "#FFFFFF",
  },
  evalTabDate: {
    fontSize: 11,
    opacity: 0.7,
  },
  evalMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },
  periodRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    flexWrap: "wrap",
  },
  teamFilterRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  teamFilterChip: {
    background: "#FFFFFF",
    border: "1px solid #D9D4C7",
    color: "#1A1A1A",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  teamFilterChipActive: {
    background: "#111111",
    borderColor: "#111111",
    color: "#FFFFFF",
  },
  teamBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: "#5C6B73",
    fontWeight: 700,
    marginBottom: 10,
  },
  teamRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  linkCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderLeft: "4px solid #E2231A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  linkRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  linkInput: {
    flex: 1,
    minWidth: 180,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #D9D4C7",
    fontSize: 12,
    fontFamily: "monospace",
    color: "#6B6B6B",
    background: "#F7F7F5",
  },
  compareSelectRow: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  overallCompareCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  overallCompareNums: {
    display: "flex",
    gap: 8,
    fontFamily: "'Oswald', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#111111",
  },
  compareNums: {
    fontSize: 13,
    color: "#6B6B6B",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  deltaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "3px 8px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  deltaUp: {
    background: "#E4EEE0",
    color: "#2F5D46",
  },
  deltaDown: {
    background: "#F4E0DD",
    color: "#8A3A31",
  },
  deltaNeutral: {
    background: "#EFEFEF",
    color: "#6B6B6B",
  },
  radarCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  radarHint: {
    fontSize: 11,
    color: "#B9B2A0",
    textAlign: "center",
    margin: "4px 0 0",
    fontWeight: 600,
  },
  drilldownHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 10px 0",
    marginBottom: 4,
  },
  categoryBlock: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  categoryHeadRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },
  categoryLabel: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 15,
    letterSpacing: 0.5,
    fontWeight: 600,
  },
  categoryAvg: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 18,
    fontWeight: 700,
  },
  kpsTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  kpsTh: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: "#8A8A8A",
    borderBottom: "2px solid #1A1A1A",
    whiteSpace: "nowrap",
  },
  kpsRow: {
    borderBottom: "1px solid #E3E3E3",
  },
  kpsTd: {
    padding: "12px 16px",
    fontSize: 14,
  },
  skillRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 0",
    borderTop: "1px solid #F0F0F0",
    gap: 10,
    flexWrap: "wrap",
  },
  skillBlock: {
    padding: "10px 0",
    borderTop: "1px solid #F0F0F0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  skillTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  infoBanner: {
    background: "#F3EBDA",
    color: "#5A4A25",
    padding: "12px 14px",
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 20,
  },
  readOnlyScorePill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    height: 32,
    padding: "0 8px",
    borderRadius: 8,
    color: "#FFFFFF",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 15,
    fontWeight: 700,
  },
  scoreButtons: {
    display: "flex",
    gap: 8,
  },
  scoreBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: "1.5px solid",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Oswald', sans-serif",
  },
  goalChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },
  goalChipMet: {
    background: "#E4EEE0",
    color: "#2F5D46",
  },
  goalChipPending: {
    background: "#F3EBDA",
    color: "#8A6D3D",
  },
  iconBtnGhost: {
    background: "transparent",
    border: "none",
    color: "#6B6B6B",
    cursor: "pointer",
    padding: 2,
    display: "flex",
    alignItems: "center",
  },
  goalNote: {
    fontSize: 12,
    color: "#6B6B6B",
    fontStyle: "italic",
  },
  charCount: {
    fontSize: 11,
    color: "#B9B2A0",
    textAlign: "right",
    marginTop: -4,
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6B6B6B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  progressButtons: {
    display: "flex",
    gap: 3,
    flexWrap: "wrap",
  },
  progressBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: "1px solid",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
  progressBtnCompact: {
    width: 22,
    height: 22,
    borderRadius: 5,
    border: "1px solid",
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#5C6B73",
    minWidth: 34,
  },
  coachPlayerCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  coachPlayerHead: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    paddingBottom: 10,
    marginBottom: 6,
    borderBottom: "1px solid #F0F0F0",
  },
  goalEditRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "#F7F7F5",
    borderRadius: 8,
    padding: 10,
  },
  goalsOverviewCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderLeft: "4px solid #111111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  goalsOverviewHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 6,
  },
  goalOverviewRow: {
    padding: "10px 0",
    borderTop: "1px solid #F0F0F0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  goalOverviewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  goalOverviewCat: {
    fontSize: 11,
    color: "#B9B2A0",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  noSkills: {
    color: "#B9B2A0",
    fontSize: 13,
    fontStyle: "italic",
  },
  settingsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 0",
    borderTop: "1px solid #F0F0F0",
    gap: 10,
  },
  skillGroupBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px dashed #E3E3E3",
  },
  skillGroupHeadRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  skillGroupName: {
    fontWeight: 700,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: "#6B6B6B",
  },
  skillGroupSelect: {
    padding: "4px 6px",
    borderRadius: 6,
    border: "1px solid #E3E3E3",
    fontSize: 12,
    fontFamily: "inherit",
    background: "#FFFFFF",
  },
  groupChip: {
    background: "#FFFFFF",
    border: "1px solid #D9D4C7",
    color: "#6B6B6B",
    padding: "3px 9px",
    borderRadius: 14,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },
  groupChipActive: {
    background: "#111111",
    borderColor: "#111111",
    color: "#FFFFFF",
  },
  editInput: {
    flex: 1,
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #111111",
    fontSize: 14,
    fontFamily: "inherit",
  },
  iconBtn: {
    background: "#F7F7F5",
    border: "1px solid #E3E3E3",
    borderRadius: 6,
    padding: 6,
    cursor: "pointer",
    color: "#1A1A1A",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,17,17,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 10,
  },
  modalCard: {
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    maxWidth: 340,
    width: "100%",
  },
  modalTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 18,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
};
