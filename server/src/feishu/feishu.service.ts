/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:31
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:31
 * @FilePath: \feishu-work\server\src\feishu\feishu.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export const FEISHU_BASE = 'https://open.feishu.cn/open-apis';

/**
 * 飞书基础服务：token 缓存 + 通用请求封装
 * 对应 docs/04 第二节
 */
@Injectable()
export class FeishuService {
  private readonly logger = new Logger(FeishuService.name);
  private http: AxiosInstance;
  private tenantToken = '';
  private tenantExpireAt = 0;
  private appToken = '';
  private appExpireAt = 0;

  constructor(private config: ConfigService) {
    this.http = axios.create({ baseURL: FEISHU_BASE, timeout: 15000 });
  }

  get appId(): string {
    return this.config.get<string>('FEISHU_APP_ID') || '';
  }

  get appSecret(): string {
    return this.config.get<string>('FEISHU_APP_SECRET') || '';
  }

  private async fetchToken(path: string): Promise<{ token: string; expire: number }> {
    const res = await this.http.post(path, { app_id: this.appId, app_secret: this.appSecret });
    if (res.data.code !== 0) throw new Error(`获取飞书 token 失败: ${res.data.msg}`);
    const token = res.data.tenant_access_token || res.data.app_access_token;
    return { token, expire: res.data.expire || 7200 };
  }

  /** 租户级 token（服务端 OpenAPI / JSAPI 鉴权主用） */
  async getTenantToken(): Promise<string> {
    if (this.tenantToken && Date.now() < this.tenantExpireAt) return this.tenantToken;
    const { token, expire } = await this.fetchToken('/auth/v3/tenant_access_token/internal');
    this.tenantToken = token;
    this.tenantExpireAt = Date.now() + (expire - 60) * 1000;
    return token;
  }

  /** 应用级 token（端内免登换 user_access_token 用） */
  async getAppToken(): Promise<string> {
    if (this.appToken && Date.now() < this.appExpireAt) return this.appToken;
    const { token, expire } = await this.fetchToken('/auth/v3/app_access_token/internal');
    this.appToken = token;
    this.appExpireAt = Date.now() + (expire - 60) * 1000;
    return token;
  }

  /** 通用请求（默认带 tenant token；可传入 token 覆盖，如 user_access_token） */
  async request(method: 'get' | 'post', path: string, body?: unknown, token?: string): Promise<any> {
    const tk = token || (await this.getTenantToken());
    let res;
    try {
      res = await this.http.request({
        method,
        url: path,
        data: body,
        headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json; charset=utf-8' },
      });
    } catch (err: any) {
      // HTTP 层错误（如 400/401/403），飞书返回的 body 里有具体业务错误，记录便于排查
      const detail = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
      this.logger.error(`飞书 API ${method.toUpperCase()} ${path} HTTP 失败: ${detail}`);
      const msg = err?.response?.data?.msg || err?.response?.data?.message || err.message;
      throw new Error(`飞书 API 请求失败: ${msg}`);
    }
    if (res.data.code !== 0) {
      this.logger.warn(`飞书 API ${method.toUpperCase()} ${path} 失败: ${JSON.stringify(res.data)}`);
      throw new Error(`飞书 API 失败: ${res.data.msg || res.data.code}`);
    }
    return res.data.data;
  }
}
