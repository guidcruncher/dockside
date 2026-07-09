// ./src/docker/dockerDaemonClient.ts
import { IncomingMessage } from "http"
import crypto from "crypto"
import { normalizeStats } from "./statsNormalizer.js"

import { parseDockerImage } from "./parseImageRef.js"
import type { ManagedProject } from "../../store/types.js"
import type { DockerRequestOptions, LocalClient } from "./clients/localClient.js"
import type { ContainerCreateRequest } from "./types-createcontainer.js"
import { DockerMultiplexedStream } from "./streams/dockerMultiplexedStream.js"
import type {
  SystemDescriptor,
  ComposeLinkInfo,
  ContainerCreateResponse,
  ContainerInspectResponse,
  ContainerSummaryResponse,
  ContainerStatsResponse,
  ExecCreateResponse,
  ImageInspectResponse,
  ImageSummary,
  SystemInfo,
  SystemVersion,
} from "./types.js"
import { DockSideId } from "./types.js"

export class DockerClientService {
  constructor(private readonly client: LocalClient) {}

  // -----------------------------
  // System
  // -----------------------------
  getVersion() {
    return this.get<SystemVersion>("/version")
  }

  getInfo() {
    return this.get<SystemInfo>("/info")
  }

  async getSystemDescriptor(): Promise<SystemDescriptor> {
    const res = await this.get<SystemInfo>("/info")
    const ver = await this.get<SystemVersion>("/version")
    return {
      Architecture: res.Architecture,
      Os: res.OSType,
      Platform: ver.Variant ? `${ver.Os}/${ver.Arch}/${ver.Variant}` : `${ver.Os}/${ver.Arch}`,
    } as SystemDescriptor
  }

  ping() {
    return this.get<string>("/_ping")
  }

  events(filters?: Record<string, string[]>) {
    const qs =
      filters && Object.keys(filters).length
        ? `?filters=${encodeURIComponent(JSON.stringify(filters))}`
        : ""
    return this.stream<IncomingMessage>(`/events${qs}`)
  }

  // -----------------------------
  // Containers

  // -----------------------------
  // Pause container
  pauseContainer(id: string) {
    return this.post<void>(`/containers/${id}/pause`)
  }

  // Unpause container
  unpauseContainer(id: string) {
    return this.post<void>(`/containers/${id}/unpause`)
  }

  // Kill container
  killContainer(id: string, signal = "SIGKILL") {
    return this.post<void>(`/containers/${id}/kill?signal=${signal}`)
  }

  // Resize TTY
  resizeContainerTTY(id: string, height: number, width: number) {
    return this.post<void>(`/containers/${id}/resize?h=${height}&w=${width}`)
  }

  // Update container resources
  updateContainer(
    id: string,
    config: {
      CpuShares?: number
      Memory?: number
      MemorySwap?: number
      BlkioWeight?: number
      CpuPeriod?: number
      CpuQuota?: number
      CpusetCpus?: string
      CpusetMems?: string
      PidsLimit?: number
    },
  ) {
    return this.post(`/containers/${id}/update`, config)
  }

  // List processes inside container
  topContainer(id: string, psArgs = "-ef") {
    return this.get<{ Titles: string[]; Processes: string[][] }>(
      `/containers/${id}/top?ps_args=${encodeURIComponent(psArgs)}`,
    )
  }

  // Wait for container to exit
  waitContainer(id: string, condition: "not-running" | "next-exit" = "not-running") {
    return this.post<{ StatusCode: number }>(`/containers/${id}/wait?condition=${condition}`)
  }

  // Stat container archive (HEAD)
  statContainerArchive(id: string, path: string) {
    return this.request<IncomingMessage>({
      path: `/containers/${id}/archive?path=${encodeURIComponent(path)}`,
      method: "HEAD",
    })
  }

  listContainersWithFilters(all = true, filters?: Record<string, string[]>) {
    let url = `/containers/json?all=${all ? 1 : 0}`

    if (filters) {
      const encoded = encodeURIComponent(JSON.stringify(filters))
      url += `&filters=${encoded}`
    }

    return this.get<ContainerSummaryResponse[]>(url)
  }

  listContainers(all = true) {
    return this.get<ContainerSummaryResponse[]>(`/containers/json?all=${all ? 1 : 0}`)
  }

  async listProjectContainers(projectName: string) {
    return this.listContainersWithFilters(true, {
      label: [`com.docker.compose.project=${projectName}`],
    })
  }

  inspectContainer(id: string) {
    return this.get<ContainerInspectResponse>(`/containers/${id}/json`)
  }

  async createContainer(
    prj: ManagedProject,
    targetContainerName: string,
    config: ContainerCreateRequest,
    platform?: string,
  ) {
    const query = new URLSearchParams()
    query.append("name", targetContainerName)
    if (platform) {
      query.append("platform", platform)
    } else {
      const res = await this.getSystemDescriptor()
      query.append("platform", res.Platform)
    }

    if (!config.Labels) {
      config.Labels = {}
    }
    config.Labels[DockSideId] = prj.dsId
    config.Labels["com.docker.compose.project"] = prj.projectName
    config.Labels["com.docker.compose.project.config_files"] = prj.configPath
    config.Labels["com.docker.compose.project.working_dir"] = prj.folderPath
    config.Labels["com.docker.compose.service"] = targetContainerName

    return this.post<ContainerCreateResponse>(`/containers/create?${query.toString()}`, config)
  }

  startContainer(id: string) {
    return this.post<void>(`/containers/${id}/start`)
  }

  stopContainer(id: string, timeout?: number) {
    const qs = timeout ? `?t=${timeout}` : ""
    return this.post<void>(`/containers/${id}/stop${qs}`)
  }

  restartContainer(id: string, timeout?: number) {
    const qs = timeout ? `?t=${timeout}` : ""
    return this.post<void>(`/containers/${id}/restart${qs}`)
  }

  removeContainer(id: string, opts: { force?: boolean; volumes?: boolean } = {}) {
    const qs = new URLSearchParams()
    if (opts.force) qs.set("force", "1")
    if (opts.volumes) qs.set("v", "1")
    return this.delete<void>(`/containers/${id}?${qs.toString()}`)
  }

  getContainerLogs(id: string, follow = false, stdout = true, stderr = true) {
    const qs = new URLSearchParams({
      stdout: stdout ? "1" : "0",
      stderr: stderr ? "1" : "0",
      follow: follow ? "1" : "0",
    })
    return this.stream<IncomingMessage>(`/containers/${id}/logs?${qs.toString()}`)
  }

  getContainerStats(id: string, stream = true) {
    return this.stream<IncomingMessage>(`/containers/${id}/stats?stream=${stream ? 1 : 0}`)
  }

  async getCurrentContainerStats(id: string) {
    const stats = await this.get<ContainerStatsResponse>(`/containers/${id}/stats?stream=0`)
    if (!stats) return

    return normalizeStats(stats)
  }

  // -----------------------------
  // Attach (multiplexed or raw)
  // -----------------------------
  async attachContainer(
    id: string,
    opts: {
      logs?: boolean
      stream?: boolean
      stdin?: boolean
      stdout?: boolean
      stderr?: boolean
      detachKeys?: string
      tty?: boolean
    } = {},
  ) {
    const qs = new URLSearchParams({
      logs: opts.logs ? "1" : "0",
      stream: opts.stream ? "1" : "0",
      stdin: opts.stdin ? "1" : "0",
      stdout: opts.stdout ? "1" : "0",
      stderr: opts.stderr ? "1" : "0",
    })

    if (opts.detachKeys) qs.set("detachKeys", opts.detachKeys)

    const stream = await this.post<IncomingMessage>(`/containers/${id}/attach?${qs.toString()}`, {})

    if (opts.tty) return stream // raw stream

    return new DockerMultiplexedStream(stream)
  }

  // -----------------------------
  // Exec
  // -----------------------------
  createExec(id: string, config: unknown) {
    return this.post<ExecCreateResponse>(`/containers/${id}/exec`, config)
  }

  startExec(execId: string, config: unknown) {
    return this.post<IncomingMessage>(`/exec/${execId}/start`, config)
  }

  async startExecMultiplexed(execId: string, config: unknown) {
    const stream = await this.post<IncomingMessage>(`/exec/${execId}/start`, config)
    return new DockerMultiplexedStream(stream)
  }

  // -----------------------------
  // Images
  // -----------------------------
  async getImageManifestDigest(image: string): Promise<string | null> {
    const inspect = await this.inspectImage(image)

    if (!inspect?.RootFS?.Layers || !inspect?.Id) {
      return null
    }

    const configDigest = inspect.Id.replace("sha256:", "")

    const manifest = {
      schemaVersion: 2,
      mediaType: "application/vnd.oci.image.manifest.v1+json",
      config: {
        mediaType: "application/vnd.oci.image.config.v1+json",
        size: 0, // unknown, but irrelevant for digest
        digest: `sha256:${configDigest}`,
      },
      layers: inspect.RootFS.Layers.map((d: string) => ({
        mediaType: "application/vnd.oci.image.layer.v1.tar+gzip",
        size: 0, // unknown, irrelevant
        digest: d,
      })),
    }

    const canonical = JSON.stringify(manifest)
    const digest = crypto.createHash("sha256").update(canonical).digest("hex")

    return digest
  }

  listImages() {
    return this.get<ImageSummary[]>("/images/json")
  }

  inspectImage(name: string) {
    return this.get<ImageInspectResponse>(`/images/${encodeURIComponent(name)}/json`)
  }

  pullImage(name: string, platform?: string) {
    const parts = parseDockerImage(name)
    const qs = new URLSearchParams({ fromImage: parts.image })
    if (platform) {
      qs.append("platform", platform)
    }
    if (parts.tag && parts.tag != "") {
      qs.append("tag", parts.tag)
    }
    return this.stream<IncomingMessage>(`/images/create?${qs.toString()}`)
  }

  removeImage(name: string, force = false) {
    return this.delete<void>(`/images/${encodeURIComponent(name)}?force=${force ? 1 : 0}`)
  }

  // -----------------------------
  // Networks
  // -----------------------------
  // List networks
  listNetworks(filters?: Record<string, string[]>) {
    const qs = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ""
    return this.get<any[]>(`/networks${qs}`)
  }

  // Connect container to network
  connectNetwork(
    network: string,
    config: {
      Container: string
      EndpointConfig?: {
        IPAMConfig?: {
          IPv4Address?: string
          IPv6Address?: string
          LinkLocalIPs?: string[]
        }
        Links?: string[]
        Aliases?: string[]
      }
    },
  ) {
    return this.post(`/networks/${network}/connect`, config)
  }

  // Disconnect container from network
  disconnectNetwork(network: string, config: { Container: string; Force?: boolean }) {
    return this.post(`/networks/${network}/disconnect`, config)
  }

  async networkInspect(name: string) {
    return this.get(`/networks/${name}`)
  }

  async networkCreate(config: { Name: string; Driver?: string; Labels?: Record<string, string> }) {
    return this.post(`/networks/create`, config)
  }

  async networkRemove(name: string) {
    return this.delete(`/networks/${name}`)
  }

  // -----------------------------
  // Volumes
  // -----------------------------
  listVolumes(filters?: Record<string, string[]>) {
    const qs = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ""
    return this.get<{
      Volumes: Array<{
        Name: string
        Driver: string
        Mountpoint: string
        Labels?: Record<string, string>
        Scope: string
      }>
      Warnings?: string[]
    }>(`/volumes${qs}`)
  }

  async volumeInspect(name: string) {
    return this.get(`/volumes/${name}`)
  }

  async volumeCreate(config: { Name: string; Driver?: string; Labels?: Record<string, string> }) {
    return this.post(`/volumes/create`, config)
  }

  async volumeRemove(name: string) {
    return this.delete(`/volumes/${name}`)
  }

  // -----------------------------
  // Secrets
  // -----------------------------
  async secretInspect(name: string) {
    return this.get(`/secrets/${name}`)
  }

  async secretCreate(config: { Name: string; Data: string }) {
    return this.post(`/secrets/create`, config)
  }

  async secretRemove(name: string) {
    return this.delete(`/secrets/${name}`)
  }

  // -----------------------------
  // Configs
  // -----------------------------
  async configInspect(name: string) {
    return this.get(`/configs/${name}`)
  }

  async configCreate(config: { Name: string; Data: string }) {
    return this.post(`/configs/create`, config)
  }

  async configRemove(name: string) {
    return this.delete(`/configs/${name}`)
  }

  // -----------------------------
  // Prune
  // -----------------------------
  containerPrune(filters?: Record<string, string[]>) {
    const qs = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ""
    return this.post(`/containers/prune${qs}`)
  }

  imagePrune(filters?: Record<string, string[]>) {
    const qs = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ""
    return this.post(`/images/prune${qs}`)
  }

  networkPrune(filters?: Record<string, string[]>) {
    const qs = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ""
    return this.post(`/networks/prune${qs}`)
  }

  volumePrune(filters?: Record<string, string[]>) {
    const qs = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ""
    return this.post(`/volumes/prune${qs}`)
  }

  buildCachePrune(filters?: Record<string, string[]>) {
    const qs = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ""
    return this.post(`/build/prune${qs}`)
  }

  buildImage(tarStream: NodeJS.ReadableStream, options: Record<string, string> = {}) {
    const qs = new URLSearchParams(options).toString()
    return this.client.request<IncomingMessage>({
      path: `/build?${qs}`,
      method: "POST",
      headers: { "Content-Type": "application/x-tar" },
      body: tarStream,
      stream: true,
    })
  }

  buildPrune(filters?: Record<string, string[]>) {
    return this.buildCachePrune(filters)
  }

  commitContainer(
    id: string,
    options: {
      repo?: string
      tag?: string
      comment?: string
      author?: string
      pause?: boolean
      changes?: string[]
    } = {},
  ) {
    const qs = new URLSearchParams()

    if (options.repo) qs.set("repo", options.repo)
    if (options.tag) qs.set("tag", options.tag)
    if (options.comment) qs.set("comment", options.comment)
    if (options.author) qs.set("author", options.author)
    if (options.pause !== undefined) qs.set("pause", options.pause ? "1" : "0")
    if (options.changes) qs.set("changes", options.changes.join("\n"))

    return this.post(`/commit?container=${id}&${qs.toString()}`)
  }

  exportContainer(id: string) {
    return this.stream<IncomingMessage>(`/containers/${id}/export`)
  }

  importImage(tarStream: NodeJS.ReadableStream) {
    return this.client.request<IncomingMessage>({
      path: `/images/load`,
      method: "POST",
      headers: { "Content-Type": "application/x-tar" },
      body: tarStream,
      stream: true,
    })
  }

  saveImages(names: string[]) {
    const qs = new URLSearchParams()
    for (const n of names) qs.append("names", n)
    return this.stream<IncomingMessage>(`/images/get?${qs.toString()}`)
  }

  getContainerArchive(id: string, path: string) {
    const qs = new URLSearchParams({ path })
    return this.stream<IncomingMessage>(`/containers/${id}/archive?${qs.toString()}`)
  }

  putContainerArchive(id: string, path: string, tarStream: NodeJS.ReadableStream) {
    const qs = new URLSearchParams({ path })
    return this.client.request({
      path: `/containers/${id}/archive?${qs.toString()}`,
      method: "PUT",
      headers: { "Content-Type": "application/x-tar" },
      body: tarStream,
    })
  }

  systemDf() {
    return this.get(`/system/df`)
  }

  // -----------------------------
  // Low-level helpers
  // -----------------------------
  private get<T>(path: string) {
    return this.request<T>({ path, method: "GET" })
  }

  private post<T>(path: string, body?: unknown) {
    return this.request<T>({ path, method: "POST", body })
  }

  private delete<T>(path: string) {
    return this.request<T>({ path, method: "DELETE" })
  }

  private stream<T>(path: string) {
    return this.request<T>({ path, stream: true })
  }

  private request<T>(options: DockerRequestOptions): Promise<T> {
    return this.client.request<T>({
      ...options,
      path: options.path,
    })
  }

  async getComposeLink(containerIdOrName: string): Promise<ComposeLinkInfo | null> {
    const options = {
      path: `/containers/${encodeURIComponent(containerIdOrName)}/json`,
      method: "GET" as const,
    }

    // Inspect returns low-level engine object configuration
    const containerInfo = await this.client.request<{
      Config?: {
        Labels?: Record<string, string>
      }
    }>(options)

    const labels = containerInfo.Config?.Labels
    if (!labels) return null

    // Safeguard lookups due to noUncheckedIndexedAccess
    const dsId = labels[DockSideId]
    const projectName = labels["com.docker.compose.project"]
    const serviceName = labels["com.docker.compose.service"]
    const workingDir = labels["com.docker.compose.project.working_dir"]
    const configFile = labels["com.docker.compose.project.config_files"]

    // If it wasn't spun up by a Compose engine, these labels will be missing
    if (!projectName || !serviceName || !workingDir || !configFile) {
      return null
    }

    return {
      dsId,
      projectName,
      serviceName,
      workingDir,
      configFile,
    }
  }
}
